"use client";

import { CalendarDays, CalendarRange, Receipt, Scale, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Skeleton } from "@/components/ui/misc";
import { useOrders } from "@/hooks/use-orders";
import { categorySales, dailySeries, hourlyOrders, summary, topProducts } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { AdminTitle, Panel, StatCard } from "./admin-shell";
import { ColumnChart, HorizontalBars, SalesAreaChart } from "./charts";

export function Analytics() {
  const { orders, loading } = useOrders();
  const { catalog } = useCatalog();
  const d = useMemo(
    () => ({
      s: summary(orders),
      daily: dailySeries(orders, 30),
      top: topProducts(orders, 8),
      cats: categorySales(orders, catalog),
      hours: hourlyOrders(orders),
    }),
    [orders, catalog],
  );
  if (loading) return <Skeleton className="h-[600px] rounded-2xl" />;
  const { s } = d;
  return (
    <div className="space-y-6">
      <AdminTitle title="Sales analytics" subtitle="Cancelled orders are excluded from sales figures." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today’s sales" value={formatPrice(s.todaySales)} icon={Wallet} />
        <StatCard label="Last 7 days" value={formatPrice(s.week.revenue)} hint={`${s.week.count} orders`} icon={CalendarDays} />
        <StatCard label="Last 30 days" value={formatPrice(s.month.revenue)} hint={`${s.month.count} orders`} icon={CalendarRange} />
        <StatCard label="Total orders" value={String(orders.length)} hint={`${formatPrice(s.all.revenue)} all time`} icon={Receipt} />
        <StatCard label="Average order" value={formatPrice(s.month.aov)} hint="Last 30 days" icon={Scale} />
      </div>
      <Panel title="Daily sales, last 30 days">
        <SalesAreaChart data={d.daily} height={300} />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Best-selling products (units)">
          <HorizontalBars data={d.top} valueKey="qty" labelKey="name" />
        </Panel>
        <Panel title="Sales by category">
          <HorizontalBars data={d.cats} valueKey="revenue" labelKey="name" money />
        </Panel>
      </div>
      <Panel title="Busiest hours (all orders)">
        <ColumnChart data={d.hours} valueKey="orders" labelKey="label" />
      </Panel>
    </div>
  );
}
