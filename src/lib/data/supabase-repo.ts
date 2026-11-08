"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import type { Category, Offer, OrderStatus, PlaceOrderInput, Product, RestaurantSettings } from "@/lib/types";
import { normalizePhone } from "@/lib/validation";
import { RepoError, type DataRepo, type Topic } from "./repo-types";
import { fetchCatalog, mapCustomer, mapOrder } from "./supabase-mappers";

const ORDER_SELECT = "*, order_items(*, order_item_addons(*))";

function check<T extends { error: { message: string } | null }>(res: T): T {
  if (res.error) throw new RepoError(res.error.message);
  return res;
}

const listeners: Record<Topic, Set<() => void>> = { catalog: new Set(), orders: new Set() };
const notify = (t: Topic) => listeners[t].forEach((cb) => cb());

export const supabaseRepo: DataRepo = {
  mode: "supabase",

  getCatalog: () => fetchCatalog(getBrowserSupabase()),

  async saveProduct(p: Product) {
    const sb = getBrowserSupabase();
    check(
      await sb.from("products").upsert({
        id: p.id,
        category_id: p.categoryId,
        name: p.name,
        description: p.description,
        price: p.price,
        sale_price: p.salePrice,
        image: p.image,
        available: p.available,
        featured: p.featured,
        rating: p.rating,
        preparation_time: p.preparationTime,
        sort_order: p.sortOrder,
        updated_at: new Date().toISOString(),
      }),
    );
    check(await sb.from("product_variants").delete().eq("product_id", p.id));
    check(await sb.from("addons").delete().eq("product_id", p.id));
    if (p.variants.length) {
      check(
        await sb.from("product_variants").insert(
          p.variants.map((v, i) => ({ id: v.id, product_id: p.id, name: v.name, price_delta: v.priceDelta, sort_order: i })),
        ),
      );
    }
    if (p.addons.length) {
      check(
        await sb.from("addons").insert(
          p.addons.map((a, i) => ({ id: a.id, product_id: p.id, name: a.name, price: a.price, sort_order: i })),
        ),
      );
    }
    notify("catalog");
  },

  async deleteProduct(id) {
    check(await getBrowserSupabase().from("products").delete().eq("id", id));
    notify("catalog");
  },

  async saveCategory(c: Category) {
    check(
      await getBrowserSupabase().from("categories").upsert({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
        enabled: c.enabled,
        sort_order: c.sortOrder,
      }),
    );
    notify("catalog");
  },

  async deleteCategory(id) {
    const sb = getBrowserSupabase();
    const { count } = await sb.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count) throw new RepoError("Move or delete the products in this category first.");
    check(await sb.from("categories").delete().eq("id", id));
    notify("catalog");
  },

  async reorderCategories(ids) {
    const sb = getBrowserSupabase();
    await Promise.all(ids.map((id, i) => sb.from("categories").update({ sort_order: i }).eq("id", id).then(check)));
    notify("catalog");
  },

  async saveOffer(o: Offer) {
    check(
      await getBrowserSupabase().from("offers").upsert({
        id: o.id,
        title: o.title,
        description: o.description,
        type: o.type,
        value: o.value,
        code: o.code?.trim() ? o.code.trim().toUpperCase() : null,
        min_order: o.minOrder,
        product_id: o.productId,
        image: o.image,
        active: o.active,
        badge: o.badge,
      }),
    );
    notify("catalog");
  },

  async deleteOffer(id) {
    check(await getBrowserSupabase().from("offers").delete().eq("id", id));
    notify("catalog");
  },

  async saveSettings(settings: RestaurantSettings) {
    check(
      await getBrowserSupabase()
        .from("restaurant_settings")
        .upsert({ id: 1, data: settings, updated_at: new Date().toISOString() }),
    );
    notify("catalog");
  },

  async uploadImage(file) {
    if (file.size > 3 * 1024 * 1024) throw new RepoError("Images must be under 3 MB.");
    const sb = getBrowserSupabase();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `menu/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from("menu-images").upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) throw new RepoError(error.message);
    return sb.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
  },

  async placeOrder(input: PlaceOrderInput) {
    const { data, error } = await getBrowserSupabase().rpc("place_order", {
      payload: {
        customer: { ...input.customer, phone: normalizePhone(input.customer.phone) },
        order_type: input.orderType,
        table_number: input.tableNumber,
        notes: input.notes,
        promo_code: input.promoCode,
        items: input.lines.map((l) => ({
          product_id: l.productId,
          variant_id: l.variantId,
          addon_ids: l.addons.map((a) => a.id),
          quantity: l.quantity,
          instructions: l.instructions,
        })),
      },
    });
    if (error) throw new RepoError(error.message);
    return { id: data.id as string, orderNumber: Number(data.order_number) };
  },

  async getOrder(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { data, error } = await getBrowserSupabase().rpc("get_order_public", { p_id: id });
    if (error) throw new RepoError(error.message);
    return data ? mapOrder(data) : null;
  },

  async listOrders() {
    const res = check(
      await getBrowserSupabase().from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(1000),
    );
    return (res.data ?? []).map(mapOrder);
  },

  async updateOrderStatus(id, status: OrderStatus) {
    check(await getBrowserSupabase().from("orders").update({ status }).eq("id", id));
    notify("orders");
  },

  async updateInternalNotes(id, notes) {
    check(await getBrowserSupabase().from("orders").update({ internal_notes: notes }).eq("id", id));
    notify("orders");
  },

  async listCustomers() {
    const res = check(
      await getBrowserSupabase().from("customers").select("*").order("last_order_at", { ascending: false, nullsFirst: false }),
    );
    return (res.data ?? []).map(mapCustomer);
  },

  subscribe(topic, cb) {
    listeners[topic].add(cb);
    let cleanup = () => {};
    if (topic === "orders") {
      // Realtime only delivers rows the signed-in user may read (admins), thanks to RLS.
      const sb = getBrowserSupabase();
      const ch = sb
        .channel(`orders-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => cb())
        .subscribe();
      cleanup = () => {
        sb.removeChannel(ch);
      };
    }
    return () => {
      listeners[topic].delete(cb);
      cleanup();
    };
  },
};
