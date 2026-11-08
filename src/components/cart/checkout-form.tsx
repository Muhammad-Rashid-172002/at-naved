"use client";

import { Banknote, Lock, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { getRepo } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { validateCheckout, type CheckoutErrors, type CheckoutForm as Form } from "@/lib/validation";
import { OrderTypePicker } from "./cart-view";
import { SummaryRows } from "./order-summary";

const CUSTOMER_KEY = "atn:v1:customer";
const RECENT_KEY = "atn:v1:recent-orders";

export function rememberOrder(id: string, orderNumber: number) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as { id: string; orderNumber: number; at: string }[];
    const next = [{ id, orderNumber, at: new Date().toISOString() }, ...list.filter((x) => x.id !== id)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function readRecentOrders(): { id: string; orderNumber: number; at: string }[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const cart = useCart();
  const { catalog } = useCatalog();
  const s = catalog.settings;
  const [form, setForm] = useState<Form>({ name: "", phone: "", address: "", area: "", landmark: "", notes: "", tableNumber: "" });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const placed = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "null") as Partial<Form> | null;
      setForm((f) => ({ ...f, ...(saved ?? {}), notes: "", tableNumber: cart.tableNumber || "" }));
    } catch {
      /* ignore */
    }
  }, [cart.tableNumber]);

  if (!cart.hydrated) return <Skeleton className="h-[480px] rounded-[22px]" />;
  if (!cart.lines.length && !placed.current) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out yet"
        body="Your cart is empty. Add something tasty first."
        action={<ButtonLink href="/menu" size="lg">Browse the menu</ButtonLink>}
      />
    );
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const t = cart.totals;
  const belowMin = cart.orderType === "delivery" && t.subtotal < s.minOrder;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validateCheckout(form, cart.orderType);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    if (belowMin) {
      setServerError(`Minimum order for delivery is ${formatPrice(s.minOrder)}.`);
      return;
    }
    if (!s.acceptingOrders) {
      setServerError("The restaurant is not taking online orders right now. Please call or message us on WhatsApp.");
      return;
    }
    setSubmitting(true);
    try {
      const { id, orderNumber } = await getRepo().placeOrder({
        customer: { name: form.name.trim(), phone: form.phone, address: form.address.trim(), area: form.area.trim(), landmark: form.landmark.trim() },
        orderType: cart.orderType,
        tableNumber: cart.orderType === "dine_in" ? form.tableNumber.trim() : null,
        notes: form.notes,
        promoCode: t.codeStatus === "applied" ? cart.promoCode : "",
        lines: cart.lines,
      });
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: form.name, phone: form.phone, address: form.address, area: form.area, landmark: form.landmark }));
      rememberOrder(id, orderNumber);
      placed.current = true;
      cart.clear();
      router.push(`/order-success/${id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "We could not place your order. Please try again.");
      setSubmitting(false);
    }
  };

  const err = (k: keyof Form) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <h2 className="font-display text-xl font-bold">How do you want it?</h2>
          <div className="mt-4">
            <OrderTypePicker />
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <h2 className="font-display text-xl font-bold">Your details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name" error={errors.name} required>
              <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} {...err("name")} />
            </Field>
            <Field label="Phone number" htmlFor="phone" error={errors.phone} hint="We will call this number if the rider needs directions." required>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={form.phone} onChange={set("phone")} {...err("phone")} />
            </Field>
            {cart.orderType === "delivery" && (
              <>
                <Field label="Delivery address" htmlFor="address" error={errors.address} className="sm:col-span-2" required>
                  <Input id="address" autoComplete="street-address" placeholder="House no., street" value={form.address} onChange={set("address")} {...err("address")} />
                </Field>
                <Field label="Area" htmlFor="area" error={errors.area} required>
                  <Input id="area" placeholder="Mohalla or area" value={form.area} onChange={set("area")} {...err("area")} />
                </Field>
                <Field label="Landmark" htmlFor="landmark" hint="Optional">
                  <Input id="landmark" placeholder="Near the mosque, school…" value={form.landmark} onChange={set("landmark")} />
                </Field>
              </>
            )}
            {cart.orderType === "dine_in" && (
              <Field label="Table number" htmlFor="tableNumber" error={errors.tableNumber} required>
                <Input id="tableNumber" inputMode="numeric" value={form.tableNumber} onChange={set("tableNumber")} {...err("tableNumber")} />
              </Field>
            )}
            <Field label="Order notes" htmlFor="notes" error={errors.notes} hint="Optional" className="sm:col-span-2">
              <Textarea id="notes" maxLength={300} placeholder="Anything we should know?" value={form.notes} onChange={set("notes")} {...err("notes")} />
            </Field>
          </div>
        </section>

        <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <h2 className="font-display text-xl font-bold">Payment</h2>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-tamarind bg-mustard-soft px-4 py-4" role="radio" aria-checked="true">
            <Banknote className="h-7 w-7 shrink-0" />
            <div>
              <p className="font-bold">{cart.orderType === "delivery" ? "Cash on delivery" : "Pay at the counter"}</p>
              <p className="text-sm text-tamarind-muted">Pay {formatPrice(t.total)} in cash when you receive your food.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Your order</h2>
        <ul className="space-y-3">
          {cart.lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3 text-[15px]">
              <span>
                <span className="font-bold">{l.quantity} ×</span> {l.name}
                {(l.variantName || l.addons.length > 0) && (
                  <span className="block text-sm text-tamarind-muted">{[l.variantName, ...l.addons.map((a) => a.name)].filter(Boolean).join(", ")}</span>
                )}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <SummaryRows
          subtotal={t.subtotal}
          discount={t.discount}
          deliveryFee={t.deliveryFee}
          total={t.total}
          showDelivery={cart.orderType === "delivery"}
          discountLabel={t.appliedOffer?.title}
          className="border-t border-line pt-4"
        />
        {serverError && (
          <p role="alert" className="rounded-xl bg-ketchup-light px-4 py-3 text-sm font-semibold text-ketchup-dark">
            {serverError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={belowMin}>
          Place order
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-tamarind-muted">
          <Lock className="h-3.5 w-3.5" /> Your details are only used to deliver this order.
        </p>
      </aside>
    </form>
  );
}
