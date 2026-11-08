import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="mb-6 font-display text-4xl font-extrabold">Your cart</h1>
      <CartView />
    </div>
  );
}
