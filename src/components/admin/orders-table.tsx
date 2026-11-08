"use client";

import Link from "next/link";
import { formatOrderNumber, formatPrice, timeAgo } from "@/lib/format";
import type { Order } from "@/lib/types";
import { StatusBadge } from "./status-badge";

const TYPE_LABEL = { delivery: "Delivery", takeaway: "Takeaway", dine_in: "Table" } as const;

export function OrdersTable({ orders, compact }: { orders: Order[]; compact?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-tamarind-muted">
          <tr>
            <th className="px-5 py-2.5 font-semibold">Order</th>
            <th className="px-3 py-2.5 font-semibold">Customer</th>
            {!compact && <th className="px-3 py-2.5 font-semibold">Type</th>}
            <th className="px-3 py-2.5 font-semibold">Items</th>
            <th className="px-3 py-2.5 font-semibold">Total</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-5 py-2.5 text-right font-semibold">Placed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="group hover:bg-paper-warm">
              <td className="px-5 py-3">
                <Link href={`/admin/orders/${o.id}`} className="font-display text-base font-bold group-hover:text-ketchup">
                  {formatOrderNumber(o.orderNumber)}
                </Link>
              </td>
              <td className="px-3 py-3">
                <span className="block font-semibold">{o.customer.name}</span>
                <span className="text-tamarind-muted">{o.customer.phone}</span>
              </td>
              {!compact && (
                <td className="px-3 py-3">
                  {TYPE_LABEL[o.orderType]}
                  {o.tableNumber ? ` ${o.tableNumber}` : ""}
                </td>
              )}
              <td className="px-3 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
              <td className="px-3 py-3 font-semibold tabular-nums">{formatPrice(o.total)}</td>
              <td className="px-3 py-3">
                <StatusBadge status={o.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-right text-tamarind-muted">{timeAgo(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
