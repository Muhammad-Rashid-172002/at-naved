import { generateDemoOrders } from "@/data/demo-orders";
import { seedCatalog } from "@/data/seed";
import { uid } from "@/lib/id";
import { computeTotals, estimateMinutes, unitPriceFor } from "@/lib/pricing";
import type { Catalog, Customer, Order, OrderStatus, PlaceOrderInput } from "@/lib/types";
import { normalizePhone } from "@/lib/validation";
import { RepoError, type DataRepo, type Topic } from "./repo-types";

/**
 * DEMO MODE store. Everything lives in this browser's localStorage, so the
 * customer site, admin panel and kitchen screen stay in sync across tabs
 * of the same browser. Use Supabase mode for real multi-device operation.
 */
const KEYS = { catalog: "atn:v2:catalog", orders: "atn:v1:orders" } as const;
const CHANNEL = "atn-demo-sync";

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  channel ??= new BroadcastChannel(CHANNEL);
  return channel;
}

function emit(topic: Topic) {
  window.dispatchEvent(new CustomEvent(`atn:${topic}`));
  getChannel()?.postMessage(topic);
}

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* corrupted storage → reseed */
  }
  const value = fallback();
  write(key, value);
  return value;
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new RepoError("Browser storage is full. Use smaller images or clear demo data in Settings.");
  }
}

const loadCatalog = (): Catalog => read(KEYS.catalog, seedCatalog);
const loadOrders = (): Order[] => read(KEYS.orders, () => generateDemoOrders(loadCatalog()));

function mutateCatalog(fn: (c: Catalog) => void) {
  const c = loadCatalog();
  fn(c);
  write(KEYS.catalog, c);
  emit("catalog");
}

function mutateOrders(fn: (o: Order[]) => void) {
  const o = loadOrders();
  fn(o);
  write(KEYS.orders, o);
  emit("orders");
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export function resetDemoData() {
  window.localStorage.removeItem(KEYS.catalog);
  window.localStorage.removeItem(KEYS.orders);
  emit("catalog");
  emit("orders");
}

export const demoRepo: DataRepo = {
  mode: "demo",

  async getCatalog() {
    return loadCatalog();
  },

  async saveProduct(product) {
    mutateCatalog((c) => {
      const i = c.products.findIndex((p) => p.id === product.id);
      if (i >= 0) c.products[i] = product;
      else c.products.push(product);
    });
  },

  async deleteProduct(id) {
    mutateCatalog((c) => {
      c.products = c.products.filter((p) => p.id !== id);
      c.offers = c.offers.map((o) => (o.productId === id ? { ...o, productId: null, active: false } : o));
    });
  },

  async saveCategory(category) {
    mutateCatalog((c) => {
      if (c.categories.some((x) => x.slug === category.slug && x.id !== category.id)) {
        throw new RepoError("Another category already uses this URL name.");
      }
      const i = c.categories.findIndex((x) => x.id === category.id);
      if (i >= 0) c.categories[i] = category;
      else c.categories.push(category);
    });
  },

  async deleteCategory(id) {
    const c = loadCatalog();
    if (c.products.some((p) => p.categoryId === id)) {
      throw new RepoError("Move or delete the products in this category first.");
    }
    mutateCatalog((cat) => {
      cat.categories = cat.categories.filter((x) => x.id !== id);
    });
  },

  async reorderCategories(ids) {
    mutateCatalog((c) => {
      c.categories.forEach((x) => {
        const i = ids.indexOf(x.id);
        if (i >= 0) x.sortOrder = i;
      });
    });
  },

  async saveOffer(offer) {
    mutateCatalog((c) => {
      const code = offer.code?.trim().toUpperCase();
      if (code && c.offers.some((o) => o.id !== offer.id && o.code?.toUpperCase() === code)) {
        throw new RepoError("Another offer already uses this code.");
      }
      const i = c.offers.findIndex((o) => o.id === offer.id);
      if (i >= 0) c.offers[i] = offer;
      else c.offers.push(offer);
    });
  },

  async deleteOffer(id) {
    mutateCatalog((c) => {
      c.offers = c.offers.filter((o) => o.id !== id);
    });
  },

  async saveSettings(settings) {
    mutateCatalog((c) => {
      c.settings = settings;
    });
  },

  async uploadImage(file) {
    if (file.size > 600 * 1024) throw new RepoError("In demo mode images must be under 600 KB.");
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new RepoError("Could not read the image."));
      reader.readAsDataURL(file);
    });
  },

  async placeOrder(input: PlaceOrderInput) {
    await delay(500);
    const catalog = loadCatalog();
    if (!catalog.settings.acceptingOrders) throw new RepoError("The restaurant is not taking orders right now.");
    if (!input.lines.length) throw new RepoError("Your cart is empty.");

    // Re-price every line from the catalog, just like the server does in live mode.
    const lines = input.lines.map((l) => {
      const p = catalog.products.find((x) => x.id === l.productId);
      const cat = p && catalog.categories.find((c) => c.id === p.categoryId);
      if (!p || !p.available || !cat?.enabled) throw new RepoError(`${l.name} is no longer available. Remove it to continue.`);
      const addonIds = l.addons.map((a) => a.id).filter((id) => p.addons.some((a) => a.id === id));
      const variantId = p.variants.some((v) => v.id === l.variantId) ? l.variantId : p.variants[0]?.id ?? null;
      return {
        ...l,
        variantId,
        variantName: p.variants.find((v) => v.id === variantId)?.name ?? null,
        addons: p.addons.filter((a) => addonIds.includes(a.id)),
        unitPrice: unitPriceFor(p, variantId, addonIds),
        quantity: Math.min(50, Math.max(1, Math.round(l.quantity))),
      };
    });
    const totals = computeTotals({
      lines,
      offers: catalog.offers,
      settings: catalog.settings,
      promoCode: input.promoCode,
      orderType: input.orderType,
    });
    if (input.orderType === "delivery" && totals.subtotal < catalog.settings.minOrder) {
      throw new RepoError(`Minimum order for delivery is Rs. ${catalog.settings.minOrder}.`);
    }
    const orders = loadOrders();
    const now = new Date().toISOString();
    const order: Order = {
      id: uid("ord"),
      orderNumber: orders.reduce((m, o) => Math.max(m, o.orderNumber), 1000) + 1,
      createdAt: now,
      updatedAt: now,
      status: "pending",
      orderType: input.orderType,
      tableNumber: input.orderType === "dine_in" ? input.tableNumber : null,
      customer: { ...input.customer, phone: normalizePhone(input.customer.phone) },
      notes: input.notes.trim(),
      items: lines.map((l) => ({
        id: uid("item"),
        productId: l.productId,
        name: l.name,
        variantName: l.variantName,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        addons: l.addons.map((a) => ({ name: a.name, price: a.price })),
        instructions: l.instructions.trim(),
        lineTotal: l.unitPrice * l.quantity,
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      paymentMethod: "cod",
      promoCode: totals.codeStatus === "applied" ? input.promoCode.trim().toUpperCase() : null,
      internalNotes: "",
      statusHistory: [{ status: "pending", at: now }],
      estimatedMinutes: estimateMinutes(lines, catalog, input.orderType),
    };
    mutateOrders((list) => {
      list.unshift(order);
    });
    return { id: order.id, orderNumber: order.orderNumber };
  },

  async getOrder(id) {
    await delay(150);
    return loadOrders().find((o) => o.id === id) ?? null;
  },

  async listOrders() {
    return loadOrders();
  },

  async updateOrderStatus(id, status: OrderStatus) {
    mutateOrders((list) => {
      const o = list.find((x) => x.id === id);
      if (!o) throw new RepoError("Order not found.");
      if (o.status === status) return;
      const now = new Date().toISOString();
      o.status = status;
      o.updatedAt = now;
      o.statusHistory.push({ status, at: now });
    });
  },

  async updateInternalNotes(id, notes) {
    mutateOrders((list) => {
      const o = list.find((x) => x.id === id);
      if (o) o.internalNotes = notes;
    });
  },

  async listCustomers() {
    const map = new Map<string, Customer>();
    for (const o of [...loadOrders()].reverse()) {
      const c = map.get(o.customer.phone) ?? {
        id: o.customer.phone,
        name: o.customer.name,
        phone: o.customer.phone,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: null,
        addresses: [],
      };
      c.name = o.customer.name;
      c.totalOrders += 1;
      if (o.status !== "cancelled") c.totalSpent += o.total;
      c.lastOrderAt = o.createdAt;
      const addr = [o.customer.address, o.customer.area].filter(Boolean).join(", ");
      if (addr && !c.addresses.includes(addr)) c.addresses.push(addr);
      map.set(o.customer.phone, c);
    }
    return [...map.values()].sort((a, b) => (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""));
  },

  subscribe(topic, cb) {
    const onLocal = () => cb();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEYS[topic]) cb();
    };
    const ch = getChannel();
    const onMessage = (e: MessageEvent) => {
      if (e.data === topic) cb();
    };
    window.addEventListener(`atn:${topic}`, onLocal);
    window.addEventListener("storage", onStorage);
    ch?.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener(`atn:${topic}`, onLocal);
      window.removeEventListener("storage", onStorage);
      ch?.removeEventListener("message", onMessage);
    };
  },
};
