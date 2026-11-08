"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/format";

const HIDDEN = ["/cart", "/checkout", "/order-success", "/track-order", "/product/"];

/** Sticky "view cart" bar on phones. */
export function MobileCartBar() {
  const pathname = usePathname();
  const { totals, hydrated, bumpKey } = useCart();
  if (!hydrated || totals.itemCount === 0 || HIDDEN.some((p) => pathname.startsWith(p))) return null;
  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 pt-3 md:hidden">
      <Link
        href="/cart"
        data-cart-target
        className="flex h-14 animate-slide-up items-center justify-between rounded-2xl border border-white/10 bg-char/95 px-4 text-cream shadow-float backdrop-blur-xl"
      >
        <span className="flex items-center gap-3">
          <span key={bumpKey} className="grid h-8 min-w-8 animate-bump place-items-center rounded-full bg-flame px-2 text-sm font-extrabold text-white">
            {totals.itemCount}
          </span>
          <span className="font-bold">View cart</span>
        </span>
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          {formatPrice(totals.subtotal - totals.discount)}
          <ShoppingBag className="h-5 w-5 text-mustard" />
        </span>
      </Link>
    </div>
  );
}
