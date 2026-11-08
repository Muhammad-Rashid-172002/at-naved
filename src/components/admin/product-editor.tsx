"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, inputClass } from "@/components/ui/fields";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_FOOD_IMAGE } from "@/config/images";
import { cn } from "@/lib/cn";
import { getRepo } from "@/lib/data";
import { slugify, uid } from "@/lib/id";
import type { Product } from "@/lib/types";
import { ImagePicker } from "./image-picker";

export function emptyProduct(categoryId: string): Product {
  return {
    id: "",
    name: "",
    categoryId,
    description: "",
    price: 0,
    salePrice: null,
    image: DEFAULT_FOOD_IMAGE,
    available: true,
    featured: false,
    rating: 4.5,
    preparationTime: 10,
    sortOrder: 999,
    addons: [],
    variants: [],
  };
}

type Errors = Partial<Record<"name" | "price" | "salePrice" | "categoryId" | "options", string>>;

function validate(p: Product): Errors {
  const e: Errors = {};
  if (p.name.trim().length < 2) e.name = "Enter a product name.";
  if (!Number.isFinite(p.price) || p.price <= 0) e.price = "Enter a price above zero.";
  if (p.salePrice != null && (p.salePrice <= 0 || p.salePrice >= p.price)) e.salePrice = "Sale price must be lower than the price.";
  if (!p.categoryId) e.categoryId = "Choose a category.";
  if ([...p.variants, ...p.addons].some((x) => !x.name.trim())) e.options = "Every option and extra needs a name.";
  return e;
}

function OptionRows({
  title,
  rows,
  priceLabel,
  onChange,
  addLabel,
}: {
  title: string;
  rows: { id: string; name: string; price: number }[];
  priceLabel: string;
  onChange: (rows: { id: string; name: string; price: number }[]) => void;
  addLabel: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{title}</legend>
      <ul className="mt-2 space-y-2">
        {rows.map((r, i) => (
          <li key={r.id} className="flex gap-2">
            <input
              aria-label={`${title} name`}
              className={cn(inputClass, "py-2")}
              value={r.name}
              placeholder="Name"
              onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
            />
            <input
              aria-label={priceLabel}
              type="number"
              min={0}
              className={cn(inputClass, "w-28 py-2")}
              value={r.price}
              onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, price: Math.max(0, Number(e.target.value) || 0) } : x)))}
            />
            <button type="button" aria-label="Remove" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded-xl px-3 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...rows, { id: uid("opt"), name: "", price: 0 }])} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-ketchup">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </fieldset>
  );
}

export function ProductEditor({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  const { catalog, refresh } = useCatalog();
  const { show } = useToast();
  const [draft, setDraft] = useState<Product | null>(product);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(product);
    setErrors({});
  }, [product]);

  if (!draft) return null;
  const isNew = !draft.id;
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      let id = draft.id;
      if (isNew) {
        const base = slugify(draft.name) || "item";
        id = catalog.products.some((p) => p.id === base) ? `${base}-${uid().slice(0, 4)}` : base;
      }
      const p: Product = {
        ...draft,
        id,
        name: draft.name.trim(),
        description: draft.description.trim(),
        sortOrder: isNew ? catalog.products.filter((x) => x.categoryId === draft.categoryId).length : draft.sortOrder,
        variants: draft.variants.map((v) => ({ ...v, id: v.id.startsWith(id) ? v.id : `${id}-v-${uid().slice(0, 6)}`, name: v.name.trim() })),
        addons: draft.addons.map((a) => ({ ...a, id: a.id.startsWith(id) ? a.id : `${id}-a-${uid().slice(0, 6)}`, name: a.name.trim() })),
      };
      await getRepo().saveProduct(p);
      await refresh();
      show(isNew ? `${p.name} added to the menu` : `${p.name} saved`);
      onClose();
    } catch (err) {
      show(err instanceof Error ? err.message : "Could not save.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? "Add menu item" : `Edit ${product?.name}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {isNew ? "Add item" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <ImagePicker value={draft.image} onChange={(src) => set("image", src)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="p-name" error={errors.name} required>
            <Input id="p-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Category" htmlFor="p-cat" error={errors.categoryId} required>
            <Select id="p-cat" value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              {[...catalog.categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.enabled ? "" : " (hidden)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" htmlFor="p-desc" className="sm:col-span-2">
            <Textarea id="p-desc" value={draft.description} maxLength={240} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Price (Rs.)" htmlFor="p-price" error={errors.price} required>
            <Input id="p-price" type="number" min={0} inputMode="numeric" value={draft.price || ""} onChange={(e) => set("price", Number(e.target.value))} />
          </Field>
          <Field label="Sale price (Rs.)" htmlFor="p-sale" error={errors.salePrice} hint="Leave empty for no sale">
            <Input
              id="p-sale"
              type="number"
              min={0}
              inputMode="numeric"
              value={draft.salePrice ?? ""}
              onChange={(e) => set("salePrice", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Preparation time (minutes)" htmlFor="p-prep">
            <Input id="p-prep" type="number" min={1} max={120} value={draft.preparationTime} onChange={(e) => set("preparationTime", Math.max(1, Number(e.target.value) || 1))} />
          </Field>
          <Field label="Rating shown" htmlFor="p-rating" hint="0 to 5">
            <Input id="p-rating" type="number" min={0} max={5} step={0.1} value={draft.rating} onChange={(e) => set("rating", Math.min(5, Math.max(0, Number(e.target.value) || 0)))} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 font-semibold">
            <Switch checked={draft.available} onChange={(v) => set("available", v)} label="Available" /> Available to order
          </label>
          <label className="flex items-center gap-3 font-semibold">
            <Switch checked={draft.featured} onChange={(v) => set("featured", v)} label="Featured" /> Show on home page
          </label>
        </div>
        <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <OptionRows
            title="Options (sizes, spice)"
            priceLabel="Extra price"
            addLabel="Add option"
            rows={draft.variants.map((v) => ({ id: v.id, name: v.name, price: v.priceDelta }))}
            onChange={(rows) => set("variants", rows.map((r) => ({ id: r.id, name: r.name, priceDelta: r.price })))}
          />
          <OptionRows
            title="Extras (add-ons)"
            priceLabel="Price"
            addLabel="Add extra"
            rows={draft.addons}
            onChange={(rows) => set("addons", rows)}
          />
        </div>
        {errors.options && <p className="text-sm font-semibold text-ketchup">{errors.options}</p>}
        <p className="text-xs text-tamarind-muted">The first option is selected by default. Its extra price is usually 0.</p>
      </div>
    </Modal>
  );
}
