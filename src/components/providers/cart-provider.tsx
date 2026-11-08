"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeTotals, unitPriceFor, type Totals } from "@/lib/pricing";
import type { CartLine, OrderType, Product } from "@/lib/types";
import { useCatalog } from "./catalog-provider";

const STORAGE_KEY = "atn:v1:cart";

interface CartState {
  lines: CartLine[];
  promoCode: string;
  orderType: OrderType;
  tableNumber: string;
}

interface AddOptions {
  variantId?: string | null;
  addonIds?: string[];
  quantity?: number;
  instructions?: string;
}

interface CartContextValue extends CartState {
  hydrated: boolean;
  totals: Totals;
  bumpKey: number;
  add: (product: Product, opts?: AddOptions) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setPromoCode: (code: string) => void;
  setOrderType: (t: OrderType) => void;
  setTableNumber: (t: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const initialState: CartState = { lines: [], promoCode: "", orderType: "delivery", tableNumber: "" };

export function CartProvider({ children }: { children: ReactNode }) {
  const { catalog } = useCatalog();
  const [state, setState] = useState<CartState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<CartState>) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // Keep cart prices in sync with the latest menu and drop items that were deleted.
  useEffect(() => {
    if (!hydrated) return;
    setState((s) => {
      let changed = false;
      const lines = s.lines.flatMap((l) => {
        const p = catalog.products.find((x) => x.id === l.productId);
        if (!p) {
          changed = true;
          return [];
        }
        const price = unitPriceFor(p, l.variantId, l.addons.map((a) => a.id));
        if (price !== l.unitPrice || p.name !== l.name || p.image !== l.image) {
          changed = true;
          return [{ ...l, unitPrice: price, name: p.name, image: p.image }];
        }
        return [l];
      });
      return changed ? { ...s, lines } : s;
    });
  }, [catalog.products, hydrated]);

  const add = useCallback((product: Product, opts: AddOptions = {}) => {
    const variantId = opts.variantId !== undefined ? opts.variantId : product.variants[0]?.id ?? null;
    const addonIds = [...(opts.addonIds ?? [])].sort();
    const instructions = (opts.instructions ?? "").trim();
    const key = [product.id, variantId ?? "", addonIds.join("+"), instructions].join("|");
    const quantity = Math.max(1, opts.quantity ?? 1);
    setState((s) => {
      const existing = s.lines.find((l) => l.key === key);
      if (existing) {
        return { ...s, lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l)) };
      }
      const line: CartLine = {
        key,
        productId: product.id,
        name: product.name,
        image: product.image,
        variantId,
        variantName: product.variants.find((v) => v.id === variantId)?.name ?? null,
        addons: product.addons.filter((a) => addonIds.includes(a.id)),
        unitPrice: unitPriceFor(product, variantId, addonIds),
        quantity,
        instructions,
      };
      return { ...s, lines: [...s.lines, line] };
    });
    setBumpKey((k) => k + 1);
  }, []);

  // Stable setters (identity never changes) so consumers can safely list them as effect dependencies.
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setState((s) => ({
        ...s,
        lines:
          quantity <= 0
            ? s.lines.filter((l) => l.key !== key)
            : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, quantity) } : l)),
      })),
    [],
  );
  const remove = useCallback((key: string) => setState((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) })), []);
  const clear = useCallback(() => setState((s) => ({ ...s, lines: [], promoCode: "" })), []);
  const setPromoCode = useCallback((promoCode: string) => setState((s) => (s.promoCode === promoCode ? s : { ...s, promoCode })), []);
  const setOrderType = useCallback((orderType: OrderType) => setState((s) => (s.orderType === orderType ? s : { ...s, orderType })), []);
  const setTableNumber = useCallback((tableNumber: string) => setState((s) => (s.tableNumber === tableNumber ? s : { ...s, tableNumber })), []);

  const value = useMemo<CartContextValue>(() => {
    const totals = computeTotals({
      lines: state.lines,
      offers: catalog.offers,
      settings: catalog.settings,
      promoCode: state.promoCode,
      orderType: state.orderType,
    });
    return {
      ...state,
      hydrated,
      totals,
      bumpKey,
      add,
      setQuantity,
      remove,
      clear,
      setPromoCode,
      setOrderType,
      setTableNumber,
    };
  }, [state, hydrated, bumpKey, add, setQuantity, remove, clear, setPromoCode, setOrderType, setTableNumber, catalog.offers, catalog.settings]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
