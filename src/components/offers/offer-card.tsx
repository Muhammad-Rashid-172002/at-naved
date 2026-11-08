"use client";

import { Copy, Plus } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { FoodImage } from "@/components/ui/food-image";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import type { Offer } from "@/lib/types";

export function offerHeadline(o: Offer, price?: number): string {
  switch (o.type) {
    case "percentage":
      return `${o.value}% off`;
    case "fixed":
      return `${formatPrice(o.value)} off`;
    case "product_deal":
      return `${o.value}% off`;
    case "combo":
      return formatPrice(price ?? o.value);
  }
}

export function OfferCard({ offer, tone = "light" }: { offer: Offer; tone?: "light" | "dark" }) {
  const { getProduct } = useCatalog();
  const { add, setPromoCode } = useCart();
  const { show } = useToast();
  const product = offer.productId ? getProduct(offer.productId) : undefined;
  const dark = tone === "dark";

  const action = () => {
    if (offer.type === "combo" && product) {
      add(product);
      show(`${product.name} added to cart`);
    } else if (offer.code) {
      setPromoCode(offer.code);
      void navigator.clipboard?.writeText(offer.code).catch(() => undefined);
      show(`Code ${offer.code} will be applied at checkout`);
    }
  };

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[26px] transition duration-500 hover:-translate-y-1",
        dark ? "bg-white/[.04] ring-1 ring-white/10 hover:ring-flame/40" : "bg-white shadow-card ring-1 ring-black/[.04] hover:shadow-float",
      )}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-char-3">
        <FoodImage src={offer.image || product?.image || ""} alt="" sizes="(max-width: 768px) 100vw, 400px" className="duration-[1100ms] group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-char/80 via-transparent to-transparent" />
        {offer.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-flame px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-glow">{offer.badge}</span>
        )}
        <span className="absolute bottom-3 left-4 font-display text-3xl font-extrabold tracking-tight text-cream">
          {offerHeadline(offer, product ? effectivePrice(product) : undefined)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className={cn("font-display text-xl font-bold leading-tight", dark ? "text-cream" : "text-char")}>{offer.title}</h3>
        <p className={cn("mt-1 text-sm", dark ? "text-cream/60" : "text-tamarind-muted")}>{offer.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={cn("text-xs font-bold uppercase tracking-wider", dark ? "text-cream/40" : "text-tamarind-muted")}>
            {offer.code ? "Promo code" : offer.type === "combo" ? "Combo price" : "Deal"}
          </span>
          {offer.type === "combo" && product?.available ? (
            <button onClick={action} className="btn-shine inline-flex h-10 items-center gap-1 rounded-full bg-flame px-4 text-sm font-bold text-white transition hover:brightness-110 active:scale-95">
              <Plus className="h-4 w-4" /> Add
            </button>
          ) : offer.code ? (
            <button
              onClick={action}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-dashed px-3 font-mono text-sm font-bold",
                dark ? "border-mustard text-mustard hover:bg-mustard/10" : "border-char text-char hover:bg-cream",
              )}
              aria-label={`Use code ${offer.code}`}
            >
              {offer.code} <Copy className="h-4 w-4" />
            </button>
          ) : offer.type === "product_deal" && product ? (
            <Link href={`/product/${product.id}`} className={cn("text-sm font-bold underline underline-offset-4", dark ? "text-mustard" : "text-flame")}>
              Order it
            </Link>
          ) : (
            <span className={cn("text-xs font-semibold", dark ? "text-cream/50" : "text-tamarind-muted")}>
              {offer.minOrder > 0 ? `On orders over ${formatPrice(offer.minOrder)}` : "Applied at checkout"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
