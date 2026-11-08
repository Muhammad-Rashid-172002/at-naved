"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import { FoodImage } from "@/components/ui/food-image";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_FOOD_IMAGE } from "@/config/images";
import { getRepo } from "@/lib/data";
import { slugify } from "@/lib/id";
import type { Category } from "@/lib/types";
import { AdminTitle, Panel } from "./admin-shell";
import { ImagePicker } from "./image-picker";

export function CategoryManager() {
  const { catalog, refresh } = useCatalog();
  const { show } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cats = useMemo(() => [...catalog.categories].sort((a, b) => a.sortOrder - b.sortOrder), [catalog.categories]);
  const count = (id: string) => catalog.products.filter((p) => p.categoryId === id).length;

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

  const move = (i: number, dir: -1 | 1) => {
    const ids = cats.map((c) => c.id);
    const j = i + dir;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    void run(() => getRepo().reorderCategories(ids), "Order updated");
  };

  const save = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (name.length < 2) return setError("Enter a category name.");
    const slug = slugify(editing.slug || name);
    if (!slug) return setError("Enter a URL name using letters or numbers.");
    if (cats.some((c) => c.slug === slug && c.id !== editing.id)) return setError("Another category already uses this URL name.");
    setSaving(true);
    const isNew = !editing.id;
    const ok = await run(
      () => getRepo().saveCategory({ ...editing, id: editing.id || slug, name, slug, sortOrder: isNew ? cats.length : editing.sortOrder }),
      isNew ? `${name} created` : `${name} saved`,
    );
    setSaving(false);
    if (ok) setEditing(null);
  };

  return (
    <div>
      <AdminTitle
        title="Categories"
        subtitle="Use the arrows to change the order on the menu."
        actions={
          <Button onClick={() => { setError(null); setEditing({ id: "", slug: "", name: "", description: "", image: DEFAULT_FOOD_IMAGE, enabled: true, sortOrder: cats.length }); }}>
            <Plus className="h-4 w-4" /> New category
          </Button>
        }
      />
      <Panel>
        <ul className="divide-y divide-line">
          {cats.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
              <div className="flex flex-col">
                <button aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 hover:bg-mustard-soft disabled:opacity-20">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button aria-label={`Move ${c.name} down`} disabled={i === cats.length - 1} onClick={() => move(i, 1)} className="rounded p-1 hover:bg-mustard-soft disabled:opacity-20">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-mustard-soft">
                <FoodImage src={c.image} alt="" sizes="56px" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold">{c.name}</p>
                <p className="text-sm text-tamarind-muted">
                  /menu/{c.slug}, {count(c.id)} items
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Switch size="sm" checked={c.enabled} label={`${c.name} visible`} onChange={(v) => run(() => getRepo().saveCategory({ ...c, enabled: v }), v ? `${c.name} is visible` : `${c.name} hidden from the menu`)} />
                <span className="w-14">{c.enabled ? "Visible" : "Hidden"}</span>
              </label>
              <button aria-label={`Edit ${c.name}`} onClick={() => { setError(null); setEditing(c); }} className="rounded-lg p-2 hover:bg-mustard-soft">
                <Pencil className="h-4 w-4" />
              </button>
              <button aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)} className="rounded-lg p-2 text-tamarind-muted hover:bg-ketchup-light hover:text-ketchup">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${editing.name}` : "New category"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing?.id ? "Save changes" : "Create category"}</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <ImagePicker value={editing.image} onChange={(image) => setEditing({ ...editing, image })} />
            <Field label="Name" htmlFor="c-name" required>
              <Input id="c-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="URL name" htmlFor="c-slug" hint={`Shown as /menu/${editing.slug || "…"}`}>
              <Input id="c-slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </Field>
            <Field label="Short description" htmlFor="c-desc">
              <Input id="c-desc" value={editing.description} maxLength={80} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            {error && <p className="text-sm font-semibold text-ketchup">{error}</p>}
          </div>
        )}
      </Modal>
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await run(() => getRepo().deleteCategory(deleting.id), `${deleting.name} deleted`);
          setDeleting(null);
        }}
        title={`Delete ${deleting?.name ?? "category"}?`}
        message={deleting && count(deleting.id) > 0 ? `It still has ${count(deleting.id)} items. Move or delete them first, or hide the category instead.` : "This cannot be undone."}
        confirmLabel="Delete category"
      />
    </div>
  );
}
