import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function Price({ product, className, tone = "light" }: { product: Pick<Product, "price" | "salePrice">; className?: string; tone?: "light" | "dark" }) {
  const e = effectivePrice(product);
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-display text-xl font-extrabold tracking-tight", tone === "dark" ? "text-cream" : "text-char")}>{formatPrice(e)}</span>
      {e < product.price && (
        <span className={cn("text-sm font-semibold line-through", tone === "dark" ? "text-cream/40" : "text-tamarind-muted")}>{formatPrice(product.price)}</span>
      )}
    </span>
  );
}
