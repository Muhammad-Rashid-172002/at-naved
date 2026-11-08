"use client";

import { ArrowUpRight, Clock, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FoodImage } from "@/components/ui/food-image";
import { productExtras } from "@/config/product-details";
import { discountPercent } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { Price } from "./price";
import { ProductOptions } from "./product-options";

/** Premium quick-view dialog: large photo, ingredients, variants, add-ons, quantity and add to cart. */
export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const extras = productExtras[product.id];
  const off = discountPercent(product);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button aria-label="Close" className="absolute inset-0 animate-fade-in bg-char/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        tabIndex={-1}
        className="relative grid max-h-[94dvh] w-full animate-slide-up overflow-hidden rounded-t-[30px] bg-white shadow-float outline-none sm:max-w-5xl sm:animate-scale-in sm:rounded-[30px] md:grid-cols-[1.05fr_1fr]"
      >
        <div ref={media} className="relative aspect-[16/11] bg-char md:aspect-auto md:min-h-[560px]">
          <FoodImage src={product.image} alt={product.name} priority quality={80} sizes="(max-width: 768px) 100vw, 540px" className="animate-blur-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-char/70 via-transparent to-char/10" />
          {off > 0 && <span className="absolute left-4 top-4 rounded-full bg-flame px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white shadow-glow">{off}% off</span>}
          <div className="absolute inset-x-5 bottom-5 hidden text-cream md:block">
            {extras?.tag && <p className="eyebrow !text-mustard">{extras.tag}</p>}
            <p className="mt-2 font-display text-4xl font-extrabold leading-none tracking-tight">{product.name}</p>
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-7">
            <div>
              <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-char md:hidden">{product.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-semibold text-tamarind-muted md:mt-0">
                <span className="inline-flex items-center gap-1 text-char">
                  <Star className="h-4 w-4 fill-mustard text-mustard-dark" aria-hidden /> {product.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden /> Ready in ~{product.preparationTime} min
                </span>
              </div>
              <Price product={product} className="mt-2 [&>span:first-child]:text-3xl" />
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-char transition hover:rotate-90 hover:bg-char hover:text-cream">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-7">
            <p className="text-[15px] leading-relaxed text-tamarind-soft">{product.description}</p>
            {extras && (
              <div className="mt-5">
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-tamarind-muted">What’s inside</p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {extras.ingredients.map((i) => (
                    <li key={i} className="rounded-full bg-cream px-3 py-1.5 text-sm font-semibold text-char">{i}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6">
              <ProductOptions product={product} onAdded={onClose} flySource={() => media.current} />
            </div>
            <Link href={`/product/${product.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-flame hover:underline">
              Open full details <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
