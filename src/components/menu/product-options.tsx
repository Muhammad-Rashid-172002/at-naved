"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { flyToCart } from "@/components/fx/fly-to-cart";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/fields";
import { QuantityStepper } from "@/components/ui/quantity";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { unitPriceFor } from "@/lib/pricing";
import type { Product } from "@/lib/types";

/** Variant picker, add-ons, instructions and quantity. Used on the product page and the QR menu sheet. */
export function ProductOptions({
  product,
  onAdded,
  stickyOnMobile = false,
  flySource,
}: {
  product: Product;
  onAdded?: () => void;
  stickyOnMobile?: boolean;
  /** Element whose photo flies into the cart when adding */
  flySource?: () => HTMLElement | null;
}) {
  const { add } = useCart();
  const { show } = useToast();
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");
  const unit = unitPriceFor(product, variantId, addonIds);
  const toggle = (id: string) => setAddonIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const submit = () => {
    add(product, { variantId, addonIds, quantity: qty, instructions });
    flyToCart(flySource?.() ?? null);
    show(`${qty} × ${product.name} added to cart`);
    setQty(1);
    setAddonIds([]);
    setInstructions("");
    onAdded?.();
  };

  return (
    <div className="space-y-7">
      {product.variants.length > 0 && (
        <fieldset>
          <legend className="text-xs font-extrabold uppercase tracking-[.18em] text-tamarind-muted">Choose size / option</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {product.variants.map((v) => {
              const on = v.id === variantId;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-2xl border-2 px-4 py-3 transition duration-300 active:scale-[.98]",
                    on ? "border-char bg-char text-cream shadow-premium" : "border-line bg-white hover:border-char/30",
                  )}
                >
                  <input type="radio" name={`variant-${product.id}`} className="sr-only" checked={on} onChange={() => setVariantId(v.id)} />
                  <span className="font-bold">{v.name}</span>
                  <span className={cn("text-sm", on ? "text-cream/60" : "text-tamarind-muted")}>{v.priceDelta > 0 ? `+ ${formatPrice(v.priceDelta)}` : "Included"}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {product.addons.length > 0 && (
        <fieldset>
          <legend className="text-xs font-extrabold uppercase tracking-[.18em] text-tamarind-muted">Add extras</legend>
          <ul className="mt-3 divide-y divide-line rounded-2xl border-2 border-line bg-white">
            {product.addons.map((a) => {
              const on = addonIds.includes(a.id);
              return (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5">
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(a.id)} />
                    <span
                      aria-hidden
                      className={cn("grid h-6 w-6 place-items-center rounded-md border-2 transition", on ? "border-flame bg-flame text-white" : "border-tamarind/25")}
                    >
                      {on && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 font-semibold">{a.name}</span>
                    <span className="text-sm font-bold text-tamarind-soft">{a.price > 0 ? `+ ${formatPrice(a.price)}` : "Free"}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      <div>
        <label htmlFor={`notes-${product.id}`} className="text-xs font-extrabold uppercase tracking-[.18em] text-tamarind-muted">
          Special instructions
        </label>
        <Textarea
          id={`notes-${product.id}`}
          className="mt-3 min-h-[80px]"
          maxLength={200}
          placeholder="For example: no onions, extra crispy"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <div
        className={cn(
          "flex items-center gap-3",
          stickyOnMobile &&
            "pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0",
        )}
      >
        <QuantityStepper value={qty} onChange={setQty} />
        <Button size="lg" variant="flame" className="btn-shine flex-1" onClick={submit} disabled={!product.available}>
          {product.available ? `Add for ${formatPrice(unit * qty)}` : "Sold out today"}
        </Button>
      </div>
    </div>
  );
}
