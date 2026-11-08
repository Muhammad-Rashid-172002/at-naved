"use client";

import { Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { ProductCard } from "./product-card";

export function CategoryTabs({ active }: { active?: string }) {
  const { categories } = useCatalog();
  const tab = (on: boolean) =>
    cn(
      "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition",
      on ? "border-tamarind bg-tamarind text-white" : "border-line bg-white hover:border-tamarind/40",
    );
  return (
    <nav aria-label="Menu categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link href="/menu" className={tab(!active)} aria-current={!active ? "page" : undefined}>
        Everything
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`/menu/${c.slug}`} className={tab(active === c.slug)} aria-current={active === c.slug ? "page" : undefined}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

export function MenuBrowser({ categorySlug }: { categorySlug?: string }) {
  const { categories, visibleProducts, getCategory } = useCatalog();
  const [q, setQ] = useState("");
  const category = categorySlug ? getCategory(categorySlug) : undefined;

  const sections = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (name: string, desc: string) => !term || name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
    const cats = category ? [category] : categories;
    return cats
      .map((c) => ({ category: c, products: visibleProducts.filter((p) => p.categoryId === c.id && match(p.name, p.description)) }))
      .filter((s) => s.products.length > 0);
  }, [q, category, categories, visibleProducts]);

  if (categorySlug && (!category || !category.enabled)) {
    return (
      <EmptyState
        icon={SearchX}
        title="This category is not on the menu"
        body="It may have been renamed or switched off. Browse the full menu instead."
        action={<Link href="/menu" className="font-bold text-ketchup underline underline-offset-4">See the full menu</Link>}
      />
    );
  }

  return (
    <div>
      <div className="sticky top-[68px] z-30 -mx-4 border-b border-line bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryTabs active={categorySlug} />
          <label className="relative block lg:w-72">
            <span className="sr-only">Search the menu</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tamarind-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search zinger, pizza, fries…"
              className="h-11 w-full rounded-full border-2 border-line bg-white pl-11 pr-4 text-[15px] focus:border-tamarind focus:outline-none"
            />
          </label>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState icon={SearchX} title={`Nothing matches "${q}"`} body="Try a shorter word, like “burger” or “chicken”." />
      ) : (
        sections.map((s, si) => (
          <section key={s.category.id} id={s.category.slug} className="pt-10" aria-labelledby={`h-${s.category.id}`}>
            {!category && (
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 id={`h-${s.category.id}`} className="font-display text-3xl font-extrabold">
                    {s.category.name}
                  </h2>
                  <p className="text-tamarind-muted">{s.category.description}</p>
                </div>
                <Link href={`/menu/${s.category.slug}`} className="shrink-0 text-sm font-bold text-ketchup hover:underline">
                  Only {s.category.name.toLowerCase()}
                </Link>
              </div>
            )}
            {category && <h2 id={`h-${s.category.id}`} className="sr-only">{s.category.name}</h2>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {s.products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={si === 0 && i < 4} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
