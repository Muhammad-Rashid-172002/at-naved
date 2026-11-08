"use client";

import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

export function SummaryRows({
  subtotal,
  discount,
  deliveryFee,
  total,
  showDelivery = true,
  discountLabel,
  className,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  showDelivery?: boolean;
  discountLabel?: string;
  className?: string;
}) {
  return (
    <dl className={cn("space-y-2.5 text-[15px]", className)}>
      <div className="flex justify-between">
        <dt className="text-tamarind-muted">Subtotal</dt>
        <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      {showDelivery && (
        <div className="flex justify-between">
          <dt className="text-tamarind-muted">Delivery fee</dt>
          <dd className="font-semibold tabular-nums">{deliveryFee === 0 ? <span className="text-mint">Free</span> : formatPrice(deliveryFee)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-tamarind-muted">Discount{discountLabel ? ` (${discountLabel})` : ""}</dt>
        <dd className={cn("font-semibold tabular-nums", discount > 0 && "text-mint")}>{discount > 0 ? `− ${formatPrice(discount)}` : formatPrice(0)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t-2 border-dashed border-line pt-3">
        <dt className="font-display text-lg font-bold">Total</dt>
        <dd className="font-display text-2xl font-extrabold tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
