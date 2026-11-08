"use client";

import { CheckCircle2, Clock, Receipt, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/misc";
import { useOrders } from "@/hooks/use-orders";
import { dailySeries, statusBreakdown, summary, topProducts } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { AdminTitle, Panel, StatCard } from "./admin-shell";
import { HorizontalBars, SalesAreaChart, StatusPie } from "./charts";
import { OrdersTable } from "./orders-table";

export function Dashboard() {
  const { orders, loading, error } = useOrders();
  const data = useMemo(
    () => ({ s: summary(orders), daily: dailySeries(orders, 14), status: statusBreakdown(orders.filter((o) => Date.now() - new Date(o.createdAt).getTime() < 7 * 864e5)), top: topProducts(orders, 6) }),
    [orders],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }
  if (error) return <Panel><p className="font-semibold text-ketchup">{error}</p></Panel>;

  const { s } = data;
  return (
    <div className="space-y-6">
      <AdminTitle title="Today at AT Naveed" subtitle={new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" })} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today’s orders" value={String(s.todayOrders)} icon={Receipt} />
        <StatCard label="Today’s sales" value={formatPrice(s.todaySales)} icon={Wallet} hint="Excludes cancelled orders" />
        <StatCard label="Pending orders" value={String(s.pending)} icon={Clock} hint={`${s.active} active in total`} />
        <StatCard label="Completed today" value={String(s.completedToday)} icon={CheckCircle2} hint={`${s.completed} all time`} />
        <StatCard label="Total customers" value={String(s.customers)} icon={Users} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Daily sales, last 14 days">
          <SalesAreaChart data={data.daily} />
        </Panel>
        <Panel title="Orders by status, last 7 days">
          <StatusPie data={data.status} />
        </Panel>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Panel title="Popular products">
          <HorizontalBars data={data.top} valueKey="qty" labelKey="name" />
        </Panel>
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="text-sm font-bold text-ketchup hover:underline">All orders</Link>}>
          <OrdersTable orders={orders.slice(0, 8)} compact />
        </Panel>
      </div>
    </div>
  );
}
