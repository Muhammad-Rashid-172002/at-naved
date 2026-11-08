"use client";

import { Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { FoodImage } from "@/components/ui/food-image";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { getRepo } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { AdminTitle, Panel } from "./admin-shell";
import { ProductEditor, emptyProduct } from "./product-editor";

export function MenuManager() {
  const { catalog, refresh } = useCatalog();
  const { show } = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const cats = useMemo(() => [...catalog.categories].sort((a, b) => a.sortOrder - b.sortOrder), [catalog.categories]);
  const catName = (id: string) => catalog.categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...catalog.products]
      .filter((p) => (cat === "all" || p.categoryId === cat) && (!t || p.name.toLowerCase().includes(t)))
      .sort((a, b) => cats.findIndex((c) => c.id === a.categoryId) - cats.findIndex((c) => c.id === b.categoryId) || a.sortOrder - b.sortOrder);
  }, [catalog.products, cat, q, cats]);

  const quick = async (p: Product, patch: Partial<Product>, msg: string) => {
    try {
      await getRepo().saveProduct({ ...p, ...patch });
      await refresh();
      show(msg);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update.", "error");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await getRepo().deleteProduct(deleting.id);
      await refresh();
      show(`${deleting.name} deleted`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not delete.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <AdminTitle
        title="Menu items"
        subtitle={`${catalog.products.length} items. Changes show on the website straight away.`}
        actions={
          <Button onClick={() => setEditing(emptyProduct(cat !== "all" ? cat : cats[0]?.id ?? ""))} disabled={!cats.length}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        }
      />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1 sm:max-w-sm">
            <span className="sr-only">Search items</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tamarind-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" className="h-11 w-full rounded-xl border border-line pl-10 pr-4 focus:border-tamarind focus:outline-none" />
          </label>
          <Select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 py-0 sm:w-56">
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        {list.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No items found" body="Change the filter or add a new item." />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-tamarind-muted">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Item</th>
                  <th className="px-3 py-2.5 font-semibold">Category</th>
                  <th className="px-3 py-2.5 font-semibold">Price</th>
                  <th className="px-3 py-2.5 font-semibold">Available</th>
                  <th className="px-3 py-2.5 font-semibold">Featured</th>
                  <th className="px-5 py-2.5 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-warm">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mustard-soft">
                          <FoodImage src={p.image} alt="" sizes="48px" />
                        </span>
                        <span>
                          <span className="block font-bold">{p.name}</span>
                          <span className="text-xs text-tamarind-muted">
                            {p.variants.length} options, {p.addons.length} extras
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{catName(p.categoryId)}</td>
                    <td className="px-3 py-3 tabular-nums">
                      <span className="font-semibold">{formatPrice(effectivePrice(p))}</span>
                      {effectivePrice(p) < p.price && <span className="ml-1.5 text-xs text-tamarind-muted line-through">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="px-3 py-3">
                      <Switch size="sm" checked={p.available} label={`${p.name} available`} onChange={(v) => quick(p, { available: v }, `${p.name} is now ${v ? "available" : "sold out"}`)} />
                    </td>
                    <td className="px-3 py-3">
                      <Switch size="sm" checked={p.featured} label={`${p.name} featured`} onChange={(v) => quick(p, { featured: v }, v ? `${p.name} featured on home page` : `${p.name} removed from home page`)} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 hover:bg-mustard-soft">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <ProductEditor product={editing} open={!!editing} onClose={() => setEditing(null)} />
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete ${deleting?.name ?? "item"}?`}
        message="It will be removed from the menu and from any offer that uses it. Past orders keep their records. To hide it for a day instead, switch off Available."
        confirmLabel="Delete item"
      />
    </div>
  );
}
