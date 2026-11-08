"use client";

import { ShoppingBag, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { QuantityStepper } from "@/components/ui/quantity";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { OrderType } from "@/lib/types";
import { SummaryRows } from "./order-summary";

export function OrderTypePicker() {
  const { orderType, setOrderType, tableNumber } = useCart();
  const options: { value: OrderType; label: string; hint: string }[] = [
    { value: "delivery", label: "Delivery", hint: "To your door" },
    { value: "takeaway", label: "Takeaway", hint: "Collect it yourself" },
    ...(orderType === "dine_in" || tableNumber ? [{ value: "dine_in" as OrderType, label: "At table", hint: tableNumber ? `Table ${tableNumber}` : "Dine in" }] : []),
  ];
  return (
    <div role="radiogroup" aria-label="How do you want your order?" className="grid grid-cols-2 gap-2 sm:auto-cols-fr sm:grid-flow-col">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={orderType === o.value}
          onClick={() => setOrderType(o.value)}
          className={cn(
            "rounded-2xl border-2 px-4 py-3 text-left transition",
            orderType === o.value ? "border-tamarind bg-mustard-soft" : "border-line bg-white hover:border-tamarind/30",
          )}
        >
          <span className="block font-bold">{o.label}</span>
          <span className="text-sm text-tamarind-muted">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

export function PromoCodeInput() {
  const { promoCode, setPromoCode, totals } = useCart();
  const [draft, setDraft] = useState(promoCode);
  const msg =
    totals.codeStatus === "applied"
      ? { text: `${promoCode.toUpperCase()} applied.`, cls: "text-mint" }
      : totals.codeStatus === "invalid"
        ? { text: "That code is not valid.", cls: "text-ketchup" }
        : totals.codeStatus === "min_not_met" && totals.codeOffer
          ? { text: `Add ${formatPrice(totals.codeOffer.minOrder - (totals.subtotal - totals.productDiscount))} more to use this code.`, cls: "text-[#7A5300]" }
          : null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setPromoCode(draft.trim().toUpperCase());
      }}
    >
      <label htmlFor="promo" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
        <Tag className="h-4 w-4" /> Promo code
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="PABBI10"
          autoCapitalize="characters"
          className="h-11 min-w-0 flex-1 rounded-full border-2 border-line bg-white px-4 font-mono uppercase focus:border-tamarind focus:outline-none"
        />
        {promoCode ? (
          <Button
            variant="outline"
            onClick={() => {
              setDraft("");
              setPromoCode("");
            }}
          >
            Remove
          </Button>
        ) : (
          <Button type="submit" variant="dark" disabled={!draft.trim()}>
            Apply
          </Button>
        )}
      </div>
      {msg && <p className={cn("mt-1.5 text-sm font-semibold", msg.cls)}>{msg.text}</p>}
    </form>
  );
}

export function CartView() {
  const { lines, hydrated, totals, setQuantity, remove, orderType } = useCart();
  const { catalog } = useCatalog();
  const s = catalog.settings;

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        body="Add a Zinger, a shawarma or a deal and it will show up here."
        action={<ButtonLink href="/menu" size="lg">Browse the menu</ButtonLink>}
      />
    );
  }

  const net = totals.subtotal - totals.discount;
  const belowMin = orderType === "delivery" && totals.subtotal < s.minOrder;
  const toFree = s.freeDeliveryAbove > 0 && orderType === "delivery" && net < s.freeDeliveryAbove ? s.freeDeliveryAbove - net : 0;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
      <ul className="divide-y divide-line rounded-[22px] bg-white ring-1 ring-line">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-4 p-4 sm:p-5">
            <Link href={`/product/${l.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mustard-soft sm:h-24 sm:w-24">
              <FoodImage src={l.image} alt={l.name} sizes="96px" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold leading-tight">{l.name}</h3>
                  {l.variantName && <p className="text-sm text-tamarind-muted">{l.variantName}</p>}
                  {l.addons.length > 0 && <p className="text-sm text-tamarind-muted">With {l.addons.map((a) => a.name).join(", ")}</p>}
                  {l.instructions && <p className="mt-1 text-sm italic text-tamarind-soft">“{l.instructions}”</p>}
                </div>
                <button onClick={() => remove(l.key)} aria-label={`Remove ${l.name}`} className="rounded-full p-2 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <QuantityStepper size="sm" value={l.quantity} min={0} onChange={(n) => setQuantity(l.key, n)} />
                <span className="font-display text-lg font-extrabold tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="space-y-5 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl font-extrabold">Order summary</h2>
        <OrderTypePicker />
        <PromoCodeInput />
        <SummaryRows
          subtotal={totals.subtotal}
          discount={totals.discount}
          deliveryFee={totals.deliveryFee}
          total={totals.total}
          showDelivery={orderType === "delivery"}
          discountLabel={totals.appliedOffer?.title}
        />
        {toFree > 0 && <p className="rounded-xl bg-mustard-soft px-4 py-3 text-sm font-semibold">Add {formatPrice(toFree)} more for free delivery.</p>}
        {belowMin && <p className="rounded-xl bg-ketchup-light px-4 py-3 text-sm font-semibold text-ketchup-dark">Minimum order for delivery is {formatPrice(s.minOrder)}.</p>}
        <ButtonLink href="/checkout" size="lg" className={cn("w-full", belowMin && "pointer-events-none opacity-50")} aria-disabled={belowMin}>
          Go to checkout
        </ButtonLink>
        <Link href="/menu" className="block text-center text-sm font-bold text-tamarind-muted hover:text-tamarind">
          Add more items
        </Link>
      </aside>
    </div>
  );
}
