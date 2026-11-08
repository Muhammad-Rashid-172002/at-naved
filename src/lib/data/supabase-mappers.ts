import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Addon,
  Catalog,
  Category,
  Customer,
  Offer,
  Order,
  OrderItem,
  Product,
  RestaurantSettings,
  StatusEvent,
  Variant,
} from "@/lib/types";

type Row = Record<string, any>;

export const mapCategory = (r: Row): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? "",
  image: r.image ?? "",
  enabled: !!r.enabled,
  sortOrder: r.sort_order ?? 0,
});

export const mapProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  categoryId: r.category_id,
  description: r.description ?? "",
  price: r.price,
  salePrice: r.sale_price ?? null,
  image: r.image ?? "",
  available: !!r.available,
  featured: !!r.featured,
  rating: Number(r.rating ?? 0),
  preparationTime: r.preparation_time ?? 15,
  sortOrder: r.sort_order ?? 0,
  variants: ((r.product_variants ?? []) as Row[])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((v): Variant => ({ id: v.id, name: v.name, priceDelta: v.price_delta })),
  addons: ((r.addons ?? []) as Row[])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((a): Addon => ({ id: a.id, name: a.name, price: a.price })),
});

export const mapOffer = (r: Row): Offer => ({
  id: r.id,
  title: r.title,
  description: r.description ?? "",
  type: r.type,
  value: r.value ?? 0,
  code: r.code ?? null,
  minOrder: r.min_order ?? 0,
  productId: r.product_id ?? null,
  image: r.image ?? "",
  active: !!r.active,
  badge: r.badge ?? "",
});

export function mapOrder(r: Row): Order {
  const items: OrderItem[] = ((r.order_items ?? []) as Row[]).map((i) => ({
    id: i.id,
    productId: i.product_id ?? null,
    name: i.name,
    variantName: i.variant_name ?? null,
    unitPrice: i.unit_price,
    quantity: i.quantity,
    instructions: i.instructions ?? "",
    lineTotal: i.line_total,
    addons: ((i.order_item_addons ?? []) as Row[]).map((a) => ({ name: a.name, price: a.price })),
  }));
  return {
    id: r.id,
    orderNumber: Number(r.order_number),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    status: r.status,
    orderType: r.order_type,
    tableNumber: r.table_number ?? null,
    customer: {
      name: r.customer_name,
      phone: r.customer_phone,
      address: r.address ?? "",
      area: r.area ?? "",
      landmark: r.landmark ?? "",
    },
    notes: r.notes ?? "",
    items,
    subtotal: r.subtotal,
    deliveryFee: r.delivery_fee,
    discount: r.discount,
    total: r.total,
    paymentMethod: "cod",
    promoCode: r.promo_code ?? null,
    internalNotes: r.internal_notes ?? "",
    statusHistory: (r.status_history ?? []) as StatusEvent[],
    estimatedMinutes: r.estimated_minutes ?? 30,
  };
}

export const mapCustomer = (r: Row): Customer => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  totalOrders: r.total_orders ?? 0,
  totalSpent: r.total_spent ?? 0,
  lastOrderAt: r.last_order_at ?? null,
  addresses: r.addresses ?? [],
});

export async function fetchCatalog(sb: SupabaseClient): Promise<Catalog> {
  const [cats, prods, offers, settings] = await Promise.all([
    sb.from("categories").select("*").order("sort_order"),
    sb.from("products").select("*, product_variants(*), addons(*)").order("sort_order"),
    sb.from("offers").select("*").order("created_at"),
    sb.from("restaurant_settings").select("data").eq("id", 1).maybeSingle(),
  ]);
  const err = cats.error ?? prods.error ?? offers.error ?? settings.error;
  if (err) throw new Error(err.message);
  if (!settings.data) throw new Error("restaurant_settings row is missing. Run supabase/seed.sql.");
  return {
    categories: (cats.data ?? []).map(mapCategory),
    products: (prods.data ?? []).map(mapProduct),
    offers: (offers.data ?? []).map(mapOffer),
    settings: settings.data.data as RestaurantSettings,
  };
}
