import { computeTotals, estimateMinutes, unitPriceFor } from "@/lib/pricing";
import type { Catalog, CartLine, Order, OrderStatus, OrderType } from "@/lib/types";

/** Deterministic pseudo-random generator so the demo dashboard looks the same on every fresh start. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Hamza Khan", "Ayesha Rahman", "Bilal Shah", "Sana Malik", "Usman Ali", "Fatima Noor", "Ahmed Yousaf",
  "Zainab Iqbal", "Saad Afridi", "Hira Javed", "Imran Khattak", "Maryam Saeed", "Fahad Durrani",
  "Noor ul Ain", "Tariq Mehmood", "Areeba Khan", "Shahzaib Gul", "Kiran Bibi",
];
const AREAS = ["Main Bazaar", "G.T. Road", "Railway Road", "College Road", "Hospital Road", "Mohalla Kotay"];

/** Clearly fake demo numbers (0300 00001xx). */
const demoPhone = (i: number) => `030000001${String(i).padStart(2, "0")}`;

export function generateDemoOrders(catalog: Catalog, now = Date.now()): Order[] {
  const rand = mulberry32(20261108);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const products = catalog.products.filter((p) => p.available);
  const popular = products.filter((p) => p.featured);
  const orders: Order[] = [];
  let number = 1001;

  const makeOrder = (createdAt: number, status: OrderStatus): Order => {
    const ci = Math.floor(rand() * NAMES.length);
    const orderType: OrderType = rand() < 0.75 ? "delivery" : rand() < 0.6 ? "takeaway" : "dine_in";
    const lineCount = 1 + Math.floor(rand() * 3);
    const lines: CartLine[] = [];
    for (let i = 0; i < lineCount; i++) {
      const p = rand() < 0.6 ? pick(popular) : pick(products);
      const variantId = p.variants.length ? p.variants[rand() < 0.7 ? 0 : p.variants.length - 1].id : null;
      const addonIds = p.addons.length && rand() < 0.3 ? [p.addons[0].id] : [];
      lines.push({
        key: `${p.id}-${i}`,
        productId: p.id,
        name: p.name,
        image: p.image,
        variantId,
        variantName: p.variants.find((v) => v.id === variantId)?.name ?? null,
        addons: p.addons.filter((a) => addonIds.includes(a.id)),
        unitPrice: unitPriceFor(p, variantId, addonIds),
        quantity: 1 + (rand() < 0.25 ? 1 : 0),
        instructions: rand() < 0.15 ? "Less spicy please" : "",
      });
    }
    const totals = computeTotals({ lines, offers: catalog.offers, settings: catalog.settings, orderType });
    const created = new Date(createdAt).toISOString();
    const flow: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", ...(orderType === "delivery" ? (["out_for_delivery"] as OrderStatus[]) : []), "delivered"];
    const reached = status === "cancelled" ? ["pending", "cancelled"] : flow.slice(0, flow.indexOf(status) + 1);
    const history = reached.map((s, i) => ({ status: s as OrderStatus, at: new Date(createdAt + i * 6 * 60000).toISOString() }));
    return {
      id: `demo-${number}`,
      orderNumber: number++,
      createdAt: created,
      updatedAt: history[history.length - 1].at,
      status,
      orderType,
      tableNumber: orderType === "dine_in" ? String(1 + Math.floor(rand() * 12)) : null,
      customer: {
        name: NAMES[ci],
        phone: demoPhone(ci),
        address: orderType === "delivery" ? `House ${10 + Math.floor(rand() * 180)}, Street ${1 + Math.floor(rand() * 9)}` : "",
        area: orderType === "delivery" ? AREAS[ci % AREAS.length] : "",
        landmark: "",
      },
      notes: "",
      items: lines.map((l, i) => ({
        id: `${number}-${i}`,
        productId: l.productId,
        name: l.name,
        variantName: l.variantName,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        addons: l.addons.map((a) => ({ name: a.name, price: a.price })),
        instructions: l.instructions,
        lineTotal: l.unitPrice * l.quantity,
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      paymentMethod: "cod",
      promoCode: null,
      internalNotes: "",
      statusHistory: history,
      estimatedMinutes: estimateMinutes(lines, catalog, orderType),
    };
  };

  const DAY = 86400000;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  for (let d = 27; d >= 1; d--) {
    const count = 4 + Math.floor(rand() * 7) + (d % 7 === 2 ? 4 : 0);
    for (let i = 0; i < count; i++) {
      const t = startOfToday.getTime() - d * DAY + (12 + rand() * 11) * 3600000;
      orders.push(makeOrder(t, rand() < 0.06 ? "cancelled" : "delivered"));
    }
  }
  const todayStatuses: OrderStatus[] = ["delivered", "delivered", "delivered", "out_for_delivery", "ready", "preparing", "preparing", "confirmed", "pending", "pending"];
  todayStatuses.forEach((s, i) => {
    const minutesAgo = (todayStatuses.length - i) * 9 + Math.floor(rand() * 5);
    const t = Math.max(startOfToday.getTime() + 60000 * i, now - minutesAgo * 60000);
    orders.push(makeOrder(t, s));
  });
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
