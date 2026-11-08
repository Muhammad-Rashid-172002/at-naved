"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useCustomers } from "@/hooks/use-orders";
import { formatDate, formatPrice } from "@/lib/format";
import { AdminTitle, Panel } from "./admin-shell";

export function CustomersTable() {
  const { customers, loading, error } = useCustomers();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return customers.filter((c) => !t || c.name.toLowerCase().includes(t) || c.phone.includes(t) || c.addresses.some((a) => a.toLowerCase().includes(t)));
  }, [customers, q]);

  return (
    <div>
      <AdminTitle title="Customers" subtitle="Built automatically from orders, matched by phone number." />
      <Panel>
        <label className="relative mb-4 block max-w-sm">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tamarind-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or area" className="h-11 w-full rounded-xl border border-line pl-10 pr-4 focus:border-tamarind focus:outline-none" />
        </label>
        {loading ? (
          <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : error ? (
          <p className="font-semibold text-ketchup">{error}</p>
        ) : list.length === 0 ? (
          <EmptyState icon={Users} title={customers.length ? "No customers match" : "No customers yet"} body={customers.length ? "Try a different name or number." : "Customers appear here after their first order."} />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-tamarind-muted">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Orders</th>
                  <th className="px-3 py-2.5 font-semibold">Total spent</th>
                  <th className="px-3 py-2.5 font-semibold">Last order</th>
                  <th className="px-5 py-2.5 font-semibold">Addresses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((c) => (
                  <tr key={c.id} className="align-top hover:bg-paper-warm">
                    <td className="px-5 py-3">
                      <span className="block font-bold">{c.name}</span>
                      <span className="text-tamarind-muted">{c.phone}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{c.totalOrders}</td>
                    <td className="px-3 py-3 font-semibold tabular-nums">{formatPrice(c.totalSpent)}</td>
                    <td className="px-3 py-3 text-tamarind-muted">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "None"}</td>
                    <td className="px-5 py-3 text-tamarind-muted">{c.addresses.length ? c.addresses.slice(0, 2).join("; ") : "Takeaway or dine-in only"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
