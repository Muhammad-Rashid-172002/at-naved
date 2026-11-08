"use client";

import { ArrowLeft, Maximize2, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useOrders } from "@/hooks/use-orders";
import { cn } from "@/lib/cn";
import { getRepo } from "@/lib/data";
import { formatOrderNumber, formatTime, minutesSince } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const COLUMNS: { key: string; title: string; statuses: OrderStatus[]; accent: string }[] = [
  { key: "new", title: "New", statuses: ["pending", "confirmed"], accent: "bg-mustard text-tamarind" },
  { key: "preparing", title: "Preparing", statuses: ["preparing"], accent: "bg-orange-500 text-white" },
  { key: "ready", title: "Ready", statuses: ["ready"], accent: "bg-mint text-white" },
];

const TYPE = { delivery: "Delivery", takeaway: "Takeaway", dine_in: "Table" } as const;

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.start();
    o.stop(ctx.currentTime + 0.6);
  } catch {
    /* audio not available */
  }
}

function TicketCard({ order, now, onMove, busy }: { order: Order; now: number; onMove: (s: OrderStatus) => void; busy: boolean }) {
  const mins = minutesSince(order.createdAt, now);
  const late = mins >= 20;
  const action: { label: string; to: OrderStatus; cls: string } | null =
    order.status === "pending"
      ? { label: "Accept", to: "confirmed", cls: "bg-mustard text-tamarind" }
      : order.status === "confirmed"
        ? { label: "Start preparing", to: "preparing", cls: "bg-orange-500 text-white" }
        : order.status === "preparing"
          ? { label: "Mark ready", to: "ready", cls: "bg-mint text-white" }
          : order.status === "ready"
            ? order.orderType === "delivery"
              ? { label: "Send with rider", to: "out_for_delivery", cls: "bg-white text-tamarind" }
              : { label: order.orderType === "dine_in" ? "Served" : "Picked up", to: "delivered", cls: "bg-white text-tamarind" }
            : null;

  return (
    <article className={cn("rounded-2xl bg-[#2E1813] p-4 ring-2", late ? "ring-ketchup" : order.status === "pending" ? "ring-mustard" : "ring-white/10")}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-extrabold leading-none">{formatOrderNumber(order.orderNumber)}</p>
          <p className="mt-1 text-sm font-semibold text-white/60">
            {TYPE[order.orderType]}
            {order.tableNumber ? ` ${order.tableNumber}` : ""}, {formatTime(order.createdAt)}
          </p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-sm font-extrabold tabular-nums", late ? "bg-ketchup text-white" : "bg-white/10")}>{mins} min</span>
      </header>
      {order.status === "pending" && <p className="mt-2 inline-block rounded bg-mustard/20 px-2 py-0.5 text-xs font-bold text-mustard">Waiting for acceptance</p>}
      <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
        {order.items.map((i) => (
          <li key={i.id}>
            <p className="text-lg font-bold leading-snug">
              <span className="text-mustard">{i.quantity}×</span> {i.name}
            </p>
            {(i.variantName || i.addons.length > 0) && (
              <p className="text-sm text-white/70">{[i.variantName, ...i.addons.map((a) => `+ ${a.name}`)].filter(Boolean).join(", ")}</p>
            )}
            {i.instructions && <p className="mt-0.5 rounded bg-ketchup/25 px-2 py-0.5 text-sm font-semibold text-[#FFC9C0]">{i.instructions}</p>}
          </li>
        ))}
      </ul>
      {order.notes && <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm"><span className="font-bold">Note:</span> {order.notes}</p>}
      {action && (
        <button
          onClick={() => onMove(action.to)}
          disabled={busy}
          className={cn("mt-4 h-14 w-full rounded-xl text-lg font-extrabold transition active:scale-[.98] disabled:opacity-50", action.cls)}
        >
          {action.label}
        </button>
      )}
    </article>
  );
}

export function KitchenBoard() {
  const { orders, loading, error } = useOrders();
  const { show } = useToast();
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [sound, setSound] = useState(true);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const pendingIds = orders.filter((o) => o.status === "pending").map((o) => o.id);
    if (seen.current && sound && pendingIds.some((id) => !seen.current?.has(id))) beep();
    seen.current = new Set(pendingIds);
  }, [orders, loading, sound]);

  const move = async (o: Order, to: OrderStatus) => {
    setBusy(o.id);
    try {
      await getRepo().updateOrderStatus(o.id, to);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update the order.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" aria-label="Back to admin" className="rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-extrabold">Kitchen</h1>
          <span className="hidden text-white/50 sm:inline">{new Date(now).toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" })}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSound((s) => !s)} aria-label={sound ? "Mute new-order sound" : "Turn on new-order sound"} className="rounded-full p-2.5 hover:bg-white/10">
            {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button onClick={() => void document.documentElement.requestFullscreen?.().catch(() => undefined)} aria-label="Full screen" className="rounded-full p-2.5 hover:bg-white/10">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </header>
      {error && <p className="bg-ketchup px-6 py-2 font-semibold">{error}</p>}
      <div className="grid flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => col.statuses.includes(o.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return (
            <section key={col.key} aria-labelledby={`col-${col.key}`} className="flex min-h-[200px] flex-col rounded-3xl bg-white/[.03] p-3">
              <h2 id={`col-${col.key}`} className="mb-3 flex items-center justify-between px-1">
                <span className={cn("rounded-full px-3 py-1 font-display text-lg font-extrabold", col.accent)}>{col.title}</span>
                <span className="text-2xl font-extrabold tabular-nums text-white/60">{list.length}</span>
              </h2>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {loading ? (
                  <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
                ) : list.length === 0 ? (
                  <p className="px-2 py-10 text-center text-white/40">No orders</p>
                ) : (
                  list.map((o) => <TicketCard key={o.id} order={o} now={now} busy={busy === o.id} onMove={(to) => void move(o, to)} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
