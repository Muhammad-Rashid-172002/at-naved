"use client";

import { Clock, Eye, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { flyToCart } from "@/components/fx/fly-to-cart";
import { Tilt } from "@/components/fx/tilt";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { FoodImage } from "@/components/ui/food-image";
import { productExtras } from "@/config/product-details";
import { cn } from "@/lib/cn";
import { discountPercent } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { Price } from "./price";
import { ProductQuickView } from "./product-quick-view";

export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const { add } = useCart();
  const { show } = useToast();
  const [quick, setQuick] = useState(false);
  const media = useRef<HTMLAnchorElement>(null);
  const off = discountPercent(product);
  const hasOptions = product.variants.length > 1;
  const tag = productExtras[product.id]?.tag;

  return (
    <>
      <Tilt max={5} className={cn("group h-full rounded-[26px]", className)}>
        <article className="relative flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-card ring-1 ring-black/[.04] transition-shadow duration-500 group-hover:shadow-float">
          <Link
            ref={media}
            href={`/product/${product.id}`}
            className="relative block aspect-[4/3] overflow-hidden bg-char-3"
            tabIndex={-1}
            aria-hidden
          >
            <FoodImage src={product.image} alt={product.name} priority={priority} className="duration-[900ms] group-hover:scale-[1.08]" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-char/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(400px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,.18),transparent_45%)] group-hover:opacity-100" />
            <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {off > 0 && <span className="rounded-full bg-flame px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-glow">{off}% off</span>}
              {tag && <span className="rounded-full bg-char/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cream backdrop-blur">{tag}</span>}
            </span>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-extrabold text-char backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-mustard text-mustard-dark" aria-hidden /> {product.rating.toFixed(1)}
              <span className="sr-only">out of 5</span>
            </span>
            {!product.available && (
              <span className="absolute inset-0 grid place-items-center bg-char/70 font-display text-lg font-bold uppercase tracking-wider text-cream backdrop-blur-[2px]">Sold out today</span>
            )}
          </Link>
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className={cn("inline-flex items-center gap-1.5", product.available ? "text-mint" : "text-ketchup")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", product.available ? "bg-mint" : "bg-ketchup")} />
                {product.available ? "Available" : "Unavailable"}
              </span>
              <span className="text-tamarind-muted/60">•</span>
              <span className="inline-flex items-center gap-1 text-tamarind-muted">
                <Clock className="h-3 w-3" aria-hidden /> {product.preparationTime} min
              </span>
            </div>
            <h3 className="mt-2 font-display text-[1.2rem] font-bold leading-tight tracking-tight text-char">
              <button type="button" onClick={() => setQuick(true)} className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none">
                {product.name}
              </button>
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-tamarind-muted">{product.description}</p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <div>
                {hasOptions && <span className="block text-[11px] font-bold uppercase tracking-wider text-tamarind-muted">From</span>}
                <Price product={product} />
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuick(true)}
                  className="hidden h-11 w-11 place-items-center rounded-full border border-line text-tamarind-muted transition hover:border-char hover:text-char sm:grid"
                  aria-label={`Quick view ${product.name}`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!product.available}
                  onClick={() => {
                    add(product);
                    flyToCart(media.current);
                    show(`${product.name} added to cart`);
                  }}
                  className="btn-shine inline-flex h-11 items-center gap-1.5 rounded-full bg-char pl-3.5 pr-4 text-sm font-bold text-cream transition duration-300 hover:bg-flame active:scale-95 disabled:bg-tamarind/15 disabled:text-tamarind-muted"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </article>
      </Tilt>
      {quick && <ProductQuickView product={product} onClose={() => setQuick(false)} />}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] bg-white ring-1 ring-line">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-tamarind/10" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-tamarind/10" />
        <div className="h-4 w-full animate-pulse rounded bg-tamarind/5" />
        <div className="h-11 w-full animate-pulse rounded-full bg-tamarind/5" />
      </div>
    </div>
  );
}
