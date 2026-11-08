"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Price } from "@/components/menu/price";
import { ProductOptions } from "@/components/menu/product-options";
import { useCart } from "@/components/providers/cart-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { FoodImage } from "@/components/ui/food-image";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Mobile-first table menu opened from the printed QR code (/qr-menu?table=5). */
export function QrMenu() {
  const params = useSearchParams();
  const table = params.get("table")?.replace(/[^\w-]/g, "").slice(0, 10) ?? "";
  const { categories, visibleProducts, catalog } = useCatalog();
  const cart = useCart();
  const { setOrderType, setTableNumber, hydrated } = cart;
  const [q, setQ] = useState("");
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [selected, setSelected] = useState<Product | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && table) {
      setOrderType("dine_in");
      setTableNumber(table);
    }
  }, [hydrated, table, setOrderType, setTableNumber]);

  // Highlight the category currently on screen.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("qr-", ""));
      },
      { rootMargin: "-130px 0px -60% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`qr-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [categories, q]);

  useEffect(() => {
    tabsRef.current?.querySelector(`[data-cat="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const sections = useMemo(() => {
    const t = q.trim().toLowerCase();
    return categories
      .map((c) => ({ c, items: visibleProducts.filter((p) => p.categoryId === c.id && (!t || p.name.toLowerCase().includes(t))) }))
      .filter((s) => s.items.length);
  }, [categories, visibleProducts, q]);

  return (
    <div className="min-h-dvh bg-paper pb-28">
      <header className="bg-mustard px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Logo />
          {table && <span className="rounded-full border-2 border-tamarind bg-white px-3 py-1 text-sm font-extrabold">Table {table}</span>}
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight">What would you like?</h1>
        <p className="text-tamarind-soft">{catalog.settings.acceptingOrders ? "Order from your seat. Pay at the counter." : "Online ordering is paused. Please order at the counter."}</p>
        <label className="relative mt-4 block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-tamarind-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the menu"
            className="h-12 w-full rounded-2xl border-2 border-tamarind bg-white pl-11 pr-4 focus:outline-none"
          />
        </label>
      </header>

      <div ref={tabsRef} className="no-scrollbar sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        {sections.map(({ c }) => (
          <a
            key={c.id}
            data-cat={c.id}
            href={`#qr-${c.id}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
              active === c.id ? "bg-tamarind text-white" : "bg-white ring-1 ring-line",
            )}
          >
            {c.name}
          </a>
        ))}
      </div>

      {sections.length === 0 && <p className="px-4 py-16 text-center text-tamarind-muted">Nothing matches “{q}”.</p>}
      {sections.map(({ c, items }) => (
        <section key={c.id} id={`qr-${c.id}`} className="scroll-mt-16 px-4 pt-6">
          <h2 className="font-display text-2xl font-extrabold">{c.name}</h2>
          <ul className="mt-3 divide-y divide-line rounded-[22px] bg-white ring-1 ring-line">
            {items.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  disabled={!p.available}
                  className="flex w-full items-center gap-3 p-3 text-left disabled:opacity-50"
                >
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mustard-soft">
                    <FoodImage src={p.image} alt="" sizes="80px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-tight">{p.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-tamarind-muted">{p.description}</span>
                    <Price product={p} className="mt-1 [&>span:first-child]:text-base" />
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ketchup text-white" aria-hidden>
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="sr-only">{p.available ? `Choose options for ${p.name}` : `${p.name} is sold out`}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div>
            <div className="relative -mx-5 -mt-5 mb-5 aspect-[16/9] bg-mustard-soft sm:-mx-6">
              <FoodImage src={selected.image} alt={selected.name} sizes="100vw" />
            </div>
            <p className="mb-5 text-tamarind-soft">{selected.description}</p>
            <ProductOptions product={selected} onAdded={() => setSelected(null)} />
          </div>
        )}
      </Modal>

      {cart.hydrated && cart.totals.itemCount > 0 && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 pt-3">
          <Link href="/cart" className="mx-auto flex h-14 max-w-xl items-center justify-between rounded-2xl bg-tamarind px-4 text-white shadow-lift">
            <span className="flex items-center gap-3">
              <span key={cart.bumpKey} className="grid h-8 min-w-8 animate-bump place-items-center rounded-full bg-mustard px-2 text-sm font-extrabold text-tamarind">
                {cart.totals.itemCount}
              </span>
              <span className="font-bold">Review order</span>
            </span>
            <span className="font-display text-lg font-bold">{formatPrice(cart.totals.subtotal - cart.totals.discount)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
