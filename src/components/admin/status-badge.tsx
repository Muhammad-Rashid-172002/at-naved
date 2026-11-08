import { Badge } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { STATUS_META } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <Badge className={m.tone}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </Badge>
  );
}
