import { ACTIVE_STATUSES, ALL_STATUSES, STATUS_META, isToday } from "./status";
import type { Catalog, Order } from "./types";

const DAY = 86400000;
const counted = (o: Order) => o.status !== "cancelled";

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function salesSince(orders: Order[], since: number) {
  const list = orders.filter((o) => counted(o) && new Date(o.createdAt).getTime() >= since);
  const revenue = list.reduce((s, o) => s + o.total, 0);
  return { revenue, count: list.length, aov: list.length ? Math.round(revenue / list.length) : 0 };
}

export function summary(orders: Order[], now = Date.now()) {
  const today = orders.filter((o) => isToday(o.createdAt, new Date(now)));
  const t0 = startOfDay(now);
  return {
    todayOrders: today.length,
    todaySales: today.filter(counted).reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    completedToday: today.filter((o) => o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "delivered").length,
    customers: new Set(orders.map((o) => o.customer.phone)).size,
    week: salesSince(orders, t0 - 6 * DAY),
    month: salesSince(orders, t0 - 29 * DAY),
    all: salesSince(orders, 0),
  };
}

export function dailySeries(orders: Order[], days: number, now = Date.now()) {
  const t0 = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const start = t0 - (days - 1 - i) * DAY;
    const list = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return counted(o) && t >= start && t < start + DAY;
    });
    return {
      label: new Date(start).toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      sales: list.reduce((s, o) => s + o.total, 0),
      orders: list.length,
    };
  });
}

export function statusBreakdown(orders: Order[]) {
  return ALL_STATUSES.map((s) => ({ status: s, name: STATUS_META[s].label, value: orders.filter((o) => o.status === s).length, color: STATUS_META[s].hex })).filter(
    (x) => x.value > 0,
  );
}

export function topProducts(orders: Order[], limit = 6) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders.filter(counted)) {
    for (const i of o.items) {
      const e = map.get(i.name) ?? { name: i.name, qty: 0, revenue: 0 };
      e.qty += i.quantity;
      e.revenue += i.lineTotal;
      map.set(i.name, e);
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export function categorySales(orders: Order[], catalog: Catalog) {
  const byProduct = new Map(catalog.products.map((p) => [p.id, p.categoryId]));
  const names = new Map(catalog.categories.map((c) => [c.id, c.name]));
  const map = new Map<string, number>();
  for (const o of orders.filter(counted)) {
    for (const i of o.items) {
      const cat = (i.productId && names.get(byProduct.get(i.productId) ?? "")) || "Other";
      map.set(cat, (map.get(cat) ?? 0) + i.lineTotal);
    }
  }
  return [...map.entries()].map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
}

export function hourlyOrders(orders: Order[]) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: `${h % 12 || 12}${h < 12 ? "a" : "p"}`, orders: 0 }));
  for (const o of orders) buckets[new Date(o.createdAt).getHours()].orders += 1;
  return buckets.filter((b) => b.hour >= 11 || b.orders > 0);
}
