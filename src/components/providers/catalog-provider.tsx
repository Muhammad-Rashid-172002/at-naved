"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getRepo } from "@/lib/data";
import type { Catalog, Category, Offer, Product } from "@/lib/types";
import { imageFor } from "@/config/images";

/** Upgrades legacy illustration paths to real photos (display only; data is untouched until saved). */
function withPhotos(c: Catalog): Catalog {
  return {
    ...c,
    categories: c.categories.map((x) => ({ ...x, image: imageFor(x) })),
    products: c.products.map((x) => ({ ...x, image: imageFor(x) })),
    offers: c.offers.map((o) => ({ ...o, image: o.productId ? imageFor({ id: o.productId, image: o.image }) : imageFor(o) })),
  };
}

interface CatalogContextValue {
  catalog: Catalog;
  ready: boolean;
  refresh: () => Promise<void>;
  /** Enabled categories, in display order */
  categories: Category[];
  activeOffers: Offer[];
  getProduct: (id: string) => Product | undefined;
  getCategory: (idOrSlug: string) => Category | undefined;
  productsIn: (categoryId: string) => Product[];
  /** Products whose category is enabled */
  visibleProducts: Product[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const [rawCatalog, setCatalog] = useState<Catalog>(initial);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCatalog(await getRepo().getCatalog());
    } catch (e) {
      console.error("[catalog] refresh failed", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return getRepo().subscribe("catalog", () => void refresh());
  }, [refresh]);

  const value = useMemo<CatalogContextValue>(() => {
    const catalog = withPhotos(rawCatalog);
    const categories = [...catalog.categories].filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    const enabledIds = new Set(categories.map((c) => c.id));
    const visibleProducts = [...catalog.products]
      .filter((p) => enabledIds.has(p.categoryId))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      catalog,
      ready,
      refresh,
      categories,
      visibleProducts,
      activeOffers: catalog.offers.filter((o) => o.active),
      getProduct: (id) => catalog.products.find((p) => p.id === id),
      getCategory: (k) => catalog.categories.find((c) => c.id === k || c.slug === k),
      productsIn: (categoryId) => visibleProducts.filter((p) => p.categoryId === categoryId),
    };
  }, [rawCatalog, ready, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
