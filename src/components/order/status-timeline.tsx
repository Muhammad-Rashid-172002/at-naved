import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { flowFor, stepLabel } from "@/lib/status";
import type { Order } from "@/lib/types";

export function StatusTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    const at = order.statusHistory.find((h) => h.status === "cancelled")?.at;
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-ketchup-light p-5 text-ketchup-dark">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ketchup text-white">
          <X className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg font-bold">This order was cancelled</p>
          <p className="text-sm">{at ? `At ${formatTime(at)}. ` : ""}Please call the restaurant if you have questions.</p>
        </div>
      </div>
    );
  }
  const flow = flowFor(order.orderType);
  const current = flow.indexOf(order.status);
  return (
    <ol className="relative space-y-0" aria-label="Order progress">
      {flow.map((s, i) => {
        const done = i < current || order.status === "delivered";
        const active = i === current && order.status !== "delivered";
        const at = order.statusHistory.find((h) => h.status === s)?.at;
        return (
          <li key={s} className="relative flex gap-4 pb-7 last:pb-0" aria-current={active ? "step" : undefined}>
            {i < flow.length - 1 && (
              <span aria-hidden className={cn("absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-[3px] rounded-full transition-colors duration-500", i < current ? "bg-mint" : "bg-line")} />
            )}
            <span
              className={cn(
                "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] transition-colors duration-500",
                done && "border-mint bg-mint text-white",
                active && "border-ketchup bg-white",
                !done && !active && "border-line bg-white",
              )}
            >
              {done && <Check className="h-4 w-4 animate-pop-check" strokeWidth={3} />}
              {active && (
                <>
                  <span className="absolute inset-0 animate-ping-slow rounded-full bg-ketchup/30" />
                  <span className="h-3 w-3 rounded-full bg-ketchup" />
                </>
              )}
            </span>
            <div className="pt-1">
              <p className={cn("font-bold", !done && !active && "text-tamarind-muted")}>{stepLabel(s, order.orderType)}</p>
              <p className="text-sm text-tamarind-muted">{at ? formatTime(at) : active ? "In progress" : "Waiting"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
