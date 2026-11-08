import type { Metadata } from "next";
import { OrderSuccessView } from "@/components/order/order-views";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <OrderSuccessView id={params.id} />
    </div>
  );
}
