import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="mb-6 font-display text-4xl font-extrabold">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
