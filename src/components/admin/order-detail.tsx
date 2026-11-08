"use client";

import { ChevronLeft, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SummaryRows } from "@/components/cart/order-summary";
import { OrderItems } from "@/components/order/order-items";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/fields";
import { ConfirmModal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/misc";
import { useOrders } from "@/hooks/use-orders";
import { getRepo } from "@/lib/data";
import { formatDateTime, formatOrderNumber, formatTime, telLink, whatsappLink } from "@/lib/format";
import { ALL_STATUSES, STATUS_META, nextStatus, stepLabel } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";
import { AdminTitle, Panel } from "./admin-shell";
import { StatusBadge } from "./status-badge";

export function OrderDetail({ id }: { id: string }) {
  const { orders, loading } = useOrders();
  const { show } = useToast();
  const order = orders.find((o) => o.id === id);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  useEffect(() => {
    if (order) setNotes(order.internalNotes);
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- only reset when switching orders

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!order)
    return (
      <Panel>
        <p className="font-semibold">Order not found.</p>
        <Link href="/admin/orders" className="mt-2 inline-block font-bold text-ketchup">Back to orders</Link>
      </Panel>
    );

  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    try {
      await getRepo().updateOrderStatus(order.id, status);
      show(`Order ${formatOrderNumber(order.orderNumber)} marked ${STATUS_META[status].label.toLowerCase()}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update the order.", "error");
    } finally {
      setBusy(false);
      setConfirmReject(false);
    }
  };

  const saveNotes = async () => {
    try {
      await getRepo().updateInternalNotes(order.id, notes);
      show("Notes saved");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not save notes.", "error");
    }
  };

  const next = nextStatus(order);
  const closed = order.status === "delivered" || order.status === "cancelled";
  const c = order.customer;

  return (
    <div>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-tamarind-muted hover:text-tamarind">
        <ChevronLeft className="h-4 w-4" /> Orders
      </Link>
      <AdminTitle
        title={`Order ${formatOrderNumber(order.orderNumber)}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={<StatusBadge status={order.status} />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Actions">
            <div className="flex flex-wrap gap-2">
              {order.status === "pending" ? (
                <>
                  <Button variant="success" onClick={() => setStatus("confirmed")} loading={busy}>
                    Accept order
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmReject(true)} disabled={busy}>
                    Reject
                  </Button>
                </>
              ) : (
                next && (
                  <Button onClick={() => setStatus(next)} loading={busy}>
                    Mark as {STATUS_META[next].label.toLowerCase()}
                  </Button>
                )
              )}
              {!closed && order.status !== "pending" && (
                <Button variant="danger" onClick={() => setConfirmReject(true)} disabled={busy}>
                  Cancel order
                </Button>
              )}
            </div>
            <label className="mt-5 block max-w-xs">
              <span className="mb-1.5 block text-sm font-bold">Set status manually</span>
              <Select value={order.status} onChange={(e) => setStatus(e.target.value as OrderStatus)} disabled={busy}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </label>
          </Panel>
          <Panel title="Items">
            <OrderItems items={order.items} />
            <SummaryRows
              subtotal={order.subtotal}
              discount={order.discount}
              deliveryFee={order.deliveryFee}
              total={order.total}
              showDelivery={order.orderType === "delivery"}
              discountLabel={order.promoCode ?? undefined}
              className="mt-3 border-t border-line pt-4"
            />
            {order.notes && (
              <p className="mt-4 rounded-xl bg-mustard-soft px-4 py-3 text-sm">
                <span className="font-bold">Customer note:</span> {order.notes}
              </p>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Customer">
            <p className="font-display text-xl font-bold">{c.name}</p>
            <p className="text-tamarind-muted">{c.phone}</p>
            <div className="mt-3 flex gap-2">
              {telLink(c.phone) && (
                <a href={telLink(c.phone)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm px-3 text-sm font-bold hover:bg-mustard-soft">
                  <Phone className="h-4 w-4" /> Call
                </a>
              )}
              {whatsappLink(c.phone) && (
                <a href={whatsappLink(c.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm px-3 text-sm font-bold hover:bg-mustard-soft">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
            <div className="mt-4 flex gap-2 border-t border-line pt-4 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-ketchup" />
              {order.orderType === "delivery" ? (
                <p>
                  {c.address}
                  {c.area && `, ${c.area}`}
                  {c.landmark && <span className="block text-tamarind-muted">Near {c.landmark}</span>}
                </p>
              ) : order.orderType === "dine_in" ? (
                <p>Dine in, table {order.tableNumber}</p>
              ) : (
                <p>Takeaway from the counter</p>
              )}
            </div>
          </Panel>
          <Panel title="Internal notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only staff can see these notes" maxLength={500} />
            <Button variant="dark" size="sm" className="mt-3" onClick={saveNotes} disabled={notes === order.internalNotes}>
              Save notes
            </Button>
          </Panel>
          <Panel title="History">
            <ol className="space-y-2 text-sm">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{stepLabel(h.status, order.orderType)}</span>
                  <span className="text-tamarind-muted">{formatTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
      <ConfirmModal
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        onConfirm={() => setStatus("cancelled")}
        loading={busy}
        title={order.status === "pending" ? "Reject this order?" : "Cancel this order?"}
        message="The customer will see the order as cancelled on their tracking page. Call them to let them know why."
        confirmLabel={order.status === "pending" ? "Reject order" : "Cancel order"}
      />
    </div>
  );
}
