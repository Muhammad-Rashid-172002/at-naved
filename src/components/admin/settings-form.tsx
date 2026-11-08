"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { ConfirmModal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { getRepo } from "@/lib/data";
import { resetDemoData } from "@/lib/data/demo-repo";
import { dataMode } from "@/lib/env";
import type { RestaurantSettings } from "@/lib/types";
import { PK_MOBILE, normalizePhone } from "@/lib/validation";
import { AdminTitle, Panel } from "./admin-shell";

export function SettingsForm() {
  const { catalog, refresh } = useCatalog();
  const { show } = useToast();
  const [s, setS] = useState<RestaurantSettings>(catalog.settings);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setS(catalog.settings), [catalog.settings]);

  const num = (k: keyof RestaurantSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Math.max(0, Number(e.target.value) || 0) });
  const txt = (k: keyof RestaurantSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value });

  const save = async () => {
    for (const [label, v] of [["Phone", s.phone], ["WhatsApp", s.whatsapp]] as const) {
      if (v && !PK_MOBILE.test(normalizePhone(v)) && !/^\+?\d{9,15}$/.test(normalizePhone(v))) return setError(`${label} number looks wrong.`);
    }
    setError(null);
    setSaving(true);
    try {
      await getRepo().saveSettings({ ...s, openingHours: s.openingHours.filter((h) => h.days.trim() && h.hours.trim()) });
      await refresh();
      show("Settings saved");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminTitle title="Restaurant settings" subtitle="Contact details, hours and delivery charges shown across the website." actions={<Button onClick={save} loading={saving}>Save settings</Button>} />
      {error && <p className="rounded-xl bg-ketchup-light px-4 py-3 font-semibold text-ketchup-dark">{error}</p>}
      <Panel title="Ordering">
        <label className="flex items-center gap-3 font-semibold">
          <Switch checked={s.acceptingOrders} onChange={(v) => setS({ ...s, acceptingOrders: v })} label="Accepting online orders" />
          {s.acceptingOrders ? "Accepting online orders" : "Online orders paused"}
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Delivery fee (Rs.)" htmlFor="s-fee"><Input id="s-fee" type="number" min={0} value={s.deliveryFee} onChange={num("deliveryFee")} /></Field>
          <Field label="Free delivery above (Rs.)" htmlFor="s-free" hint="0 turns it off"><Input id="s-free" type="number" min={0} value={s.freeDeliveryAbove} onChange={num("freeDeliveryAbove")} /></Field>
          <Field label="Minimum delivery order (Rs.)" htmlFor="s-min"><Input id="s-min" type="number" min={0} value={s.minOrder} onChange={num("minOrder")} /></Field>
          <Field label="Typical delivery time (min)" htmlFor="s-eta"><Input id="s-eta" type="number" min={5} value={s.estimatedDeliveryMins} onChange={num("estimatedDeliveryMins")} /></Field>
        </div>
      </Panel>
      <Panel title="Restaurant details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" htmlFor="s-name"><Input id="s-name" value={s.name} onChange={txt("name")} /></Field>
          <Field label="Email" htmlFor="s-email" hint="Optional"><Input id="s-email" type="email" value={s.email} onChange={txt("email")} /></Field>
          <Field label="Tagline" htmlFor="s-tag" className="sm:col-span-2"><Textarea id="s-tag" className="min-h-[64px]" value={s.tagline} maxLength={140} onChange={txt("tagline")} /></Field>
          <Field label="Phone" htmlFor="s-phone" hint="Shown on the Call buttons"><Input id="s-phone" type="tel" placeholder="0300 1234567" value={s.phone} onChange={txt("phone")} /></Field>
          <Field label="WhatsApp number" htmlFor="s-wa" hint="Used for WhatsApp ordering"><Input id="s-wa" type="tel" placeholder="0300 1234567" value={s.whatsapp} onChange={txt("whatsapp")} /></Field>
          <Field label="Address" htmlFor="s-addr"><Input id="s-addr" value={s.addressLine} onChange={txt("addressLine")} /></Field>
          <Field label="Map search text" htmlFor="s-map" hint="What Google Maps should search for"><Input id="s-map" value={s.mapQuery} onChange={txt("mapQuery")} /></Field>
          <Field label="Facebook page URL" htmlFor="s-fb"><Input id="s-fb" type="url" value={s.socials.facebook} onChange={(e) => setS({ ...s, socials: { ...s.socials, facebook: e.target.value } })} /></Field>
          <Field label="Instagram URL" htmlFor="s-ig"><Input id="s-ig" type="url" value={s.socials.instagram} onChange={(e) => setS({ ...s, socials: { ...s.socials, instagram: e.target.value } })} /></Field>
        </div>
      </Panel>
      <Panel title="Opening hours">
        <ul className="space-y-2">
          {s.openingHours.map((h, i) => (
            <li key={i} className="flex gap-2">
              <Input aria-label="Days" value={h.days} placeholder="Monday to Thursday" onChange={(e) => setS({ ...s, openingHours: s.openingHours.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)) })} />
              <Input aria-label="Hours" value={h.hours} placeholder="12:00 PM – 12:00 AM" onChange={(e) => setS({ ...s, openingHours: s.openingHours.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)) })} />
              <button aria-label="Remove row" onClick={() => setS({ ...s, openingHours: s.openingHours.filter((_, j) => j !== i) })} className="rounded-xl px-3 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => setS({ ...s, openingHours: [...s.openingHours, { days: "", hours: "" }] })} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ketchup">
          <Plus className="h-4 w-4" /> Add row
        </button>
      </Panel>
      {dataMode === "demo" && (
        <Panel title="Demo data">
          <p className="text-tamarind-muted">Demo mode keeps the menu and orders in this browser. Reset to start again from the original sample menu and orders.</p>
          <Button variant="danger" className="mt-4" onClick={() => setResetOpen(true)}>
            Reset demo data
          </Button>
        </Panel>
      )}
      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={async () => {
          resetDemoData();
          await refresh();
          setResetOpen(false);
          show("Demo data reset");
        }}
        title="Reset demo data?"
        message="All menu edits, offers and orders made in this browser will be replaced with the original sample data."
        confirmLabel="Reset"
      />
    </div>
  );
}
