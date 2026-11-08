"use client";

import type { ReactNode } from "react";
import type { Catalog } from "@/lib/types";
import { CartProvider } from "./cart-provider";
import { CatalogProvider } from "./catalog-provider";
import { ToastProvider } from "./toast-provider";

export function Providers({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return (
    <ToastProvider>
      <CatalogProvider initial={catalog}>
        <CartProvider>{children}</CartProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}
