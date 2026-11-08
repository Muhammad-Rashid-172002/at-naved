"use client";

import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { offerHeadline } from "@/components/offers/offer-card";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { FoodImage } from "@/components/ui/food-image";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { photo } from "@/config/images";
import { getRepo } from "@/lib/data";
import { uid } from "@/lib/id";
import { effectivePrice } from "@/lib/pricing";
import type { Offer, OfferType } from "@/lib/types";
import { AdminTitle, Panel } from "./admin-shell";
import { ImagePicker } from "./image-picker";

const TYPES: { value: OfferType; label: string; help: string }[] = [
  { value: "percentage", label: "Percentage off the order", help: "Customers save a percentage of their order. Add a code, or leave it empty to apply automatically." },
  { value: "fixed", label: "Fixed amount off the order", help: "Customers save a set amount once their order reaches the minimum." },
  { value: "product_deal", label: "Discount on one item", help: "A percentage off every unit of the chosen item." },
  { value: "combo", label: "Combo deal", help: "Promotes a deal item (for example Zinger + Fries + Drink). Its price comes from the menu item." },
];

const blank = (): Offer => ({ id: "", title: "", description: "", type: "percentage", value: 10, code: "", minOrder: 0, productId: null, image: photo("deal-zinger-combo"), active: true, badge: "" });

export function OfferManager() {
  const { catalog, refresh, getProduct } = useCatalog();
  const { show } = useToast();
  const [editing, setEditing] = useState<Offer | null>(null);
  const [deleting, setDeleting] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const run = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      await refresh();
      show(msg);
      return true;
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong.", "error");
      return false;
    }
  };

  const save = async () => {
    if (!editing) return;
    const o = { ...editing, title: editing.title.trim(), code: editing.code?.trim().toUpperCase() || null };
    if (o.title.length < 3) return setError("Enter a title.");
    if ((o.type === "percentage" || o.type === "product_deal") && (o.value <= 0 || o.value > 90)) return setError("Percentage must be between 1 and 90.");
    if (o.type === "fixed" && o.value <= 0) return setError("Enter the amount to take off.");
    if ((o.type === "product_deal" || o.type === "combo") && !o.productId) return setError("Choose the menu item.");
    if (o.code && !/^[A-Z0-9]{3,20}$/.test(o.code)) return setError("Codes use 3–20 letters or numbers, no spaces.");
    if (o.type === "combo" || o.type === "product_deal") o.code = null;
    if (o.type === "combo") {
      const p = o.productId ? getProduct(o.productId) : undefined;
      o.value = p ? effectivePrice(p) : o.value;
    }
    setSaving(true);
    const isNew = !o.id;
    const ok = await run(() => getRepo().saveOffer({ ...o, id: o.id || uid("offer") }), isNew ? "Offer created" : "Offer saved");
    setSaving(false);
    if (ok) setEditing(null);
  };

  const type = TYPES.find((t) => t.value === editing?.type);
  const products = [...catalog.products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <AdminTitle title="Offers and deals" subtitle="Active offers show on the website and apply at checkout." actions={<Button onClick={() => { setError(null); setEditing(blank()); }}><Plus className="h-4 w-4" /> New offer</Button>} />
      <Panel>
        {catalog.offers.length === 0 ? (
          <EmptyState icon={Tag} title="No offers yet" body="Create a combo, a promo code or an automatic discount." />
        ) : (
          <ul className="divide-y divide-line">
            {catalog.offers.map((o) => {
              const p = o.productId ? getProduct(o.productId) : undefined;
              return (
                <li key={o.id} className="flex flex-wrap items-center gap-4 py-3 sm:flex-nowrap">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mustard">
                    <FoodImage src={o.image} alt="" sizes="56px" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{o.title}</p>
                    <p className="text-sm text-tamarind-muted">
                      {TYPES.find((t) => t.value === o.type)?.label}: {offerHeadline(o, p ? effectivePrice(p) : undefined)}
                      {o.code && <span className="ml-2 rounded bg-paper-warm px-1.5 py-0.5 font-mono text-xs font-bold text-tamarind">{o.code}</span>}
                      {p && ` on ${p.name}`}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <Switch size="sm" checked={o.active} label={`${o.title} active`} onChange={(v) => run(() => getRepo().saveOffer({ ...o, active: v }), v ? "Offer is live" : "Offer paused")} />
                    <span className="w-12">{o.active ? "Live" : "Paused"}</span>
                  </label>
                  <button aria-label={`Edit ${o.title}`} onClick={() => { setError(null); setEditing({ ...o, code: o.code ?? "" }); }} className="rounded-lg p-2 hover:bg-mustard-soft">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button aria-label={`Delete ${o.title}`} onClick={() => setDeleting(o)} className="rounded-lg p-2 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit offer" : "New offer"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing?.id ? "Save offer" : "Create offer"}</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-5">
            <Field label="Type" htmlFor="o-type" hint={type?.help}>
              <Select id="o-type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as OfferType })}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="o-title" required>
                <Input id="o-title" value={editing.title} placeholder="Zinger + Fries + Drink" onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label="Badge" htmlFor="o-badge" hint="Short label, optional">
                <Input id="o-badge" value={editing.badge} maxLength={20} placeholder="Best value" onChange={(e) => setEditing({ ...editing, badge: e.target.value })} />
              </Field>
              <Field label="Description" htmlFor="o-desc" className="sm:col-span-2">
                <Textarea id="o-desc" value={editing.description} maxLength={160} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              {(editing.type === "product_deal" || editing.type === "combo") && (
                <Field label={editing.type === "combo" ? "Deal item" : "Menu item"} htmlFor="o-prod" required className="sm:col-span-2">
                  <Select id="o-prod" value={editing.productId ?? ""} onChange={(e) => setEditing({ ...editing, productId: e.target.value || null })}>
                    <option value="">Choose…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </Field>
              )}
              {editing.type !== "combo" && (
                <Field label={editing.type === "fixed" ? "Amount off (Rs.)" : "Percent off"} htmlFor="o-value" required>
                  <Input id="o-value" type="number" min={1} value={editing.value || ""} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
                </Field>
              )}
              {(editing.type === "percentage" || editing.type === "fixed") && (
                <>
                  <Field label="Minimum order (Rs.)" htmlFor="o-min">
                    <Input id="o-min" type="number" min={0} value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: Math.max(0, Number(e.target.value) || 0) })} />
                  </Field>
                  <Field label="Promo code" htmlFor="o-code" hint="Leave empty to apply automatically">
                    <Input id="o-code" value={editing.code ?? ""} className="font-mono uppercase" onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase().replace(/\s/g, "") })} />
                  </Field>
                </>
              )}
            </div>
            <ImagePicker value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
            <label className="flex items-center gap-3 font-semibold">
              <Switch checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} label="Active" /> Live on the website
            </label>
            {error && <p className="text-sm font-semibold text-ketchup">{error}</p>}
          </div>
        )}
      </Modal>
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => getRepo().deleteOffer(deleting.id), "Offer deleted");
          setDeleting(null);
        }}
        title="Delete this offer?"
        message="Customers will no longer see it or be able to use its code. To stop it temporarily, pause it instead."
        confirmLabel="Delete offer"
      />
    </div>
  );
}
