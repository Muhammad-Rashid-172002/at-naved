"use client";

import { Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useOrders } from "@/hooks/use-orders";
import { cn } from "@/lib/cn";
import { ACTIVE_STATUSES, ALL_STATUSES, STATUS_META, isToday } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";
import { AdminTitle, Panel } from "./admin-shell";
import { OrdersTable } from "./orders-table";

type Filter = "active" | "today" | "all" | OrderStatus;

export function OrdersManager() {
  const { orders, loading, error } = useOrders();
  const [filter, setFilter] = useState<Filter>("active");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^#/, "");
    return orders.filter((o) => {
      const f =
        filter === "all" ||
        (filter === "active" && ACTIVE_STATUSES.includes(o.status)) ||
        (filter === "today" && isToday(o.createdAt)) ||
        o.status === filter;
      const s = !t || String(o.orderNumber).includes(t) || o.customer.name.toLowerCase().includes(t) || o.customer.phone.includes(t);
      return f && s;
    });
  }, [orders, filter, q]);

  const count = (f: Filter) =>
    orders.filter((o) => f === "all" || (f === "active" ? ACTIVE_STATUSES.includes(o.status) : f === "today" ? isToday(o.createdAt) : o.status === f)).length;
  const tabs: Filter[] = ["active", "today", ...ALL_STATUSES, "all"];
  const label = (f: Filter) => (f === "active" ? "Active" : f === "today" ? "Today" : f === "all" ? "All" : STATUS_META[f].label);

  return (
    <div>
      <AdminTitle title="Orders" subtitle="New orders appear here automatically." />
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition",
              filter === f ? "bg-tamarind text-white" : "bg-white ring-1 ring-line hover:ring-tamarind/30",
            )}
          >
            {label(f)} <span className="opacity-60">{count(f)}</span>
          </button>
        ))}
      </div>
      <Panel>
        <label className="relative mb-4 block max-w-sm">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tamarind-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order number, name or phone"
            className="h-10 w-full rounded-full border border-line pl-10 pr-4 text-sm focus:border-tamarind focus:outline-none"
          />
        </label>
        {loading ? (
          <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : error ? (
          <p className="font-semibold text-ketchup">{error}</p>
        ) : filtered.length ? (
          <OrdersTable orders={filtered} />
        ) : (
          <EmptyState icon={Receipt} title="No orders here" body="Try another filter, or wait for the next order to come in." />
        )}
      </Panel>
    </div>
  );
}
