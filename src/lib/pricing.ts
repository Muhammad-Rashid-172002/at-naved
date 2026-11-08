import type { CartLine, Catalog, Offer, OrderType, Product, RestaurantSettings } from "./types";

export function effectivePrice(p: Pick<Product, "price" | "salePrice">): number {
  return p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
}

export function discountPercent(p: Pick<Product, "price" | "salePrice">): number {
  const e = effectivePrice(p);
  return e < p.price ? Math.round(((p.price - e) / p.price) * 100) : 0;
}

export function unitPriceFor(product: Product, variantId: string | null, addonIds: string[]): number {
  const variant = product.variants.find((v) => v.id === variantId);
  const addons = product.addons.filter((a) => addonIds.includes(a.id));
  return effectivePrice(product) + (variant?.priceDelta ?? 0) + addons.reduce((s, a) => s + a.price, 0);
}

export type CodeStatus = "none" | "applied" | "invalid" | "min_not_met";

export interface Totals {
  subtotal: number;
  productDiscount: number;
  orderDiscount: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedOffer: Offer | null;
  codeStatus: CodeStatus;
  codeOffer: Offer | null;
  itemCount: number;
}

interface TotalsInput {
  lines: Pick<CartLine, "productId" | "unitPrice" | "quantity">[];
  offers: Offer[];
  settings: Pick<RestaurantSettings, "deliveryFee" | "freeDeliveryAbove">;
  promoCode?: string;
  orderType: OrderType;
}

/**
 * Single source of truth for cart maths on the client.
 * The Supabase `place_order` function mirrors this logic on the server and is authoritative in live mode.
 */
export function computeTotals({ lines, offers, settings, promoCode, orderType }: TotalsInput): Totals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const active = offers.filter((o) => o.active);

  let productDiscount = 0;
  for (const deal of active.filter((o) => o.type === "product_deal" && o.productId)) {
    for (const l of lines) {
      if (l.productId === deal.productId) productDiscount += Math.round((l.unitPrice * l.quantity * deal.value) / 100);
    }
  }

  const afterProduct = Math.max(0, subtotal - productDiscount);
  const orderLevel = active.filter((o) => o.type === "percentage" || o.type === "fixed");
  const amountFor = (o: Offer) =>
    o.type === "percentage" ? Math.round((afterProduct * o.value) / 100) : Math.min(o.value, afterProduct);

  let appliedOffer: Offer | null = null;
  let codeOffer: Offer | null = null;
  let codeStatus: CodeStatus = "none";
  const code = promoCode?.trim().toUpperCase();
  if (code) {
    codeOffer = orderLevel.find((o) => o.code && o.code.toUpperCase() === code) ?? null;
    if (!codeOffer) codeStatus = "invalid";
    else if (afterProduct < codeOffer.minOrder) codeStatus = "min_not_met";
    else {
      appliedOffer = codeOffer;
      codeStatus = "applied";
    }
  }
  if (!appliedOffer) {
    const auto = orderLevel
      .filter((o) => !o.code && afterProduct >= o.minOrder)
      .sort((a, b) => amountFor(b) - amountFor(a));
    appliedOffer = auto[0] ?? null;
  }

  const orderDiscount = appliedOffer ? amountFor(appliedOffer) : 0;
  const discount = productDiscount + orderDiscount;
  const net = Math.max(0, subtotal - discount);
  let deliveryFee = 0;
  if (orderType === "delivery" && lines.length > 0) {
    deliveryFee = settings.freeDeliveryAbove > 0 && net >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  }
  return {
    subtotal,
    productDiscount,
    orderDiscount,
    discount,
    deliveryFee,
    total: net + deliveryFee,
    appliedOffer,
    codeStatus,
    codeOffer,
    itemCount,
  };
}

export function estimateMinutes(lines: Pick<CartLine, "productId">[], catalog: Catalog, orderType: OrderType): number {
  const maxPrep = lines.reduce((m, l) => {
    const p = catalog.products.find((x) => x.id === l.productId);
    return Math.max(m, p?.preparationTime ?? 10);
  }, 0);
  return orderType === "delivery" ? Math.max(catalog.settings.estimatedDeliveryMins, maxPrep + 15) : maxPrep + 5;
}
