import type { Order, OrderStatus, OrderType } from "./types";

export const STATUS_META: Record<OrderStatus, { label: string; tone: string; dot: string; hex: string }> = {
  pending: { label: "Pending", tone: "bg-mustard-soft text-[#7A5300] ring-mustard/50", dot: "bg-mustard-dark", hex: "#E5A800" },
  confirmed: { label: "Confirmed", tone: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500", hex: "#0EA5E9" },
  preparing: { label: "Preparing", tone: "bg-orange-50 text-orange-800 ring-orange-200", dot: "bg-orange-500", hex: "#F97316" },
  ready: { label: "Ready", tone: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500", hex: "#8B5CF6" },
  out_for_delivery: { label: "Out for delivery", tone: "bg-indigo-50 text-indigo-800 ring-indigo-200", dot: "bg-indigo-500", hex: "#6366F1" },
  delivered: { label: "Delivered", tone: "bg-mint-light text-mint ring-mint/30", dot: "bg-mint", hex: "#22784A" },
  cancelled: { label: "Cancelled", tone: "bg-ketchup-light text-ketchup-dark ring-ketchup/30", dot: "bg-ketchup", hex: "#E0301E" },
};

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const ACTIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"];

export function flowFor(type: OrderType): OrderStatus[] {
  const flow: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
  return type === "delivery" ? flow : flow.filter((s) => s !== "out_for_delivery");
}

export function nextStatus(order: Pick<Order, "status" | "orderType">): OrderStatus | null {
  if (order.status === "cancelled" || order.status === "delivered") return null;
  const flow = flowFor(order.orderType);
  const i = flow.indexOf(order.status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

/** Customer-facing wording for each step. */
export function stepLabel(status: OrderStatus, type: OrderType): string {
  switch (status) {
    case "pending":
      return "Order received";
    case "confirmed":
      return "Confirmed by restaurant";
    case "preparing":
      return "Preparing your food";
    case "ready":
      return type === "delivery" ? "Packed and ready" : "Ready";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return type === "delivery" ? "Delivered" : type === "dine_in" ? "Served" : "Picked up";
    case "cancelled":
      return "Cancelled";
  }
}

export function isToday(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
