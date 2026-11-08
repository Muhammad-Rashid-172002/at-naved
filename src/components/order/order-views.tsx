"use client";

import { Check, PackageSearch, Phone, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { SummaryRows } from "@/components/cart/order-summary";
import { readRecentOrders } from "@/components/cart/checkout-form";
import { ContactButtons } from "@/components/site/contact-buttons";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState, Skeleton } from "@/components/ui/misc";
import { useOrder } from "@/hooks/use-orders";
import { formatDateTime, formatOrderNumber, formatPrice, formatTime, telLink, whatsappLink } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import type { Order } from "@/lib/types";
import { OrderItems } from "./order-items";
import { StatusTimeline } from "./status-timeline";

function eta(order: Order) {
  return new Date(new Date(order.createdAt).getTime() + order.estimatedMinutes * 60000).toISOString();
}

function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-40 rounded-[22px]" />
      <Skeleton className="h-72 rounded-[22px]" />
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState
      icon={PackageSearch}
      title="We could not find that order"
      body="Check the link from your confirmation, or open one of your recent orders."
      action={<ButtonLink href="/track-order">See recent orders</ButtonLink>}
    />
  );
}

function OrderDetailsCard({ order }: { order: Order }) {
  return (
    <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="items-h">
      <h2 id="items-h" className="font-display text-xl font-bold">
        Order details
      </h2>
      <OrderItems items={order.items} />
      <SummaryRows
        subtotal={order.subtotal}
        discount={order.discount}
        deliveryFee={order.deliveryFee}
        total={order.total}
        showDelivery={order.orderType === "delivery"}
        className="mt-3 border-t border-line pt-4"
      />
      <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-bold">{order.orderType === "delivery" ? "Delivering to" : order.orderType === "dine_in" ? "Table" : "Pickup"}</dt>
          <dd className="text-tamarind-muted">
            {order.orderType === "delivery"
              ? [order.customer.address, order.customer.area, order.customer.landmark].filter(Boolean).join(", ")
              : order.orderType === "dine_in"
                ? `Table ${order.tableNumber}`
                : "Collect from the counter"}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Payment</dt>
          <dd className="text-tamarind-muted">Cash, {formatPrice(order.total)}</dd>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <dt className="font-bold">Your notes</dt>
            <dd className="text-tamarind-muted">{order.notes}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export function OrderSuccessView({ id }: { id: string }) {
  const { order, loading } = useOrder(id);
  const { catalog } = useCatalog();
  if (loading) return <Loading />;
  if (!order) return <NotFound />;
  const s = catalog.settings;
  const wa = whatsappLink(
    s.whatsapp,
    `Assalam o Alaikum! I just placed order ${formatOrderNumber(order.orderNumber)} (${formatPrice(order.total)}) on your website. Name: ${order.customer.name}.`,
  );
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[28px] border-[3px] border-tamarind bg-mustard p-6 text-center shadow-sticker sm:p-10">
        <span className="mx-auto grid h-16 w-16 animate-pop-check place-items-center rounded-full bg-mint text-white">
          <Check className="h-8 w-8" strokeWidth={3} />
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Order placed</h1>
        <p className="mt-2 text-lg font-medium">
          Order {formatOrderNumber(order.orderNumber)}. We will start on it as soon as the restaurant confirms.
        </p>
        <p className="mt-6 inline-flex flex-col rounded-2xl bg-white px-6 py-3">
          <span className="text-sm font-semibold text-tamarind-muted">Estimated {order.orderType === "delivery" ? "arrival" : "ready time"}</span>
          <span className="font-display text-3xl font-extrabold">{formatTime(eta(order))}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/track-order/${order.id}`} size="lg" variant="dark">
            Track your order
          </ButtonLink>
          {wa && (
            <ButtonLink href={wa} size="lg" variant="success">
              Send to WhatsApp
            </ButtonLink>
          )}
        </div>
      </section>
      <OrderDetailsCard order={order} />
      <p className="text-center">
        <Link href="/menu" className="font-bold text-ketchup hover:underline">
          Order something else
        </Link>
      </p>
    </div>
  );
}

export function TrackOrderView({ id }: { id: string }) {
  const { order, loading } = useOrder(id);
  const { catalog } = useCatalog();
  if (loading) return <Loading />;
  if (!order) return <NotFound />;
  const meta = STATUS_META[order.status];
  const tel = telLink(catalog.settings.phone);
  const live = order.status !== "delivered" && order.status !== "cancelled";
  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="track-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="track-h" className="font-display text-3xl font-extrabold">
            Order {formatOrderNumber(order.orderNumber)}
          </h1>
          <Badge className={meta.tone}>{meta.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-tamarind-muted">Placed {formatDateTime(order.createdAt)}</p>
        {live && (
          <div className="mt-5 rounded-2xl bg-mustard-soft px-4 py-3">
            <p className="text-sm font-semibold text-tamarind-muted">Estimated {order.orderType === "delivery" ? "arrival" : "ready time"}</p>
            <p className="font-display text-2xl font-extrabold">{formatTime(eta(order))}</p>
          </div>
        )}
        <div className="mt-6">
          <StatusTimeline order={order} />
        </div>
        {live && (
          <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-tamarind-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> This page updates automatically.
          </p>
        )}
        <div className="mt-6 border-t border-line pt-5">
          {tel ? (
            <ButtonLink href={tel} variant="outline">
              <Phone className="h-4 w-4" /> Call the restaurant
            </ButtonLink>
          ) : (
            <ContactButtons />
          )}
        </div>
      </section>
      <OrderDetailsCard order={order} />
    </div>
  );
}

export function RecentOrders() {
  const [list, setList] = useState<ReturnType<typeof readRecentOrders> | null>(null);
  useEffect(() => setList(readRecentOrders()), []);
  if (!list) return <Skeleton className="h-40 rounded-[22px]" />;
  if (!list.length)
    return (
      <EmptyState
        icon={Receipt}
        title="No orders on this device yet"
        body="When you place an order, it will appear here so you can follow it live."
        action={<ButtonLink href="/menu">Start an order</ButtonLink>}
      />
    );
  return (
    <ul className="divide-y divide-line rounded-[22px] bg-white ring-1 ring-line">
      {list.map((o) => (
        <li key={o.id}>
          <Link href={`/track-order/${o.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper-warm">
            <span>
              <span className="block font-display text-lg font-bold">Order {formatOrderNumber(o.orderNumber)}</span>
              <span className="text-sm text-tamarind-muted">{formatDateTime(o.at)}</span>
            </span>
            <span className="font-bold text-ketchup">Track</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
