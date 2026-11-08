import { formatPrice } from "@/lib/format";
import type { OrderItem } from "@/lib/types";

export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((i) => (
        <li key={i.id} className="flex justify-between gap-4 py-3">
          <div>
            <p className="font-bold">
              {i.quantity} × {i.name}
            </p>
            {(i.variantName || i.addons.length > 0) && (
              <p className="text-sm text-tamarind-muted">{[i.variantName, ...i.addons.map((a) => `+ ${a.name}`)].filter(Boolean).join(", ")}</p>
            )}
            {i.instructions && <p className="text-sm italic text-tamarind-soft">“{i.instructions}”</p>}
          </div>
          <span className="shrink-0 font-semibold tabular-nums">{formatPrice(i.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}
