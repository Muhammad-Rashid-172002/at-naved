import type { Metadata } from "next";
import { TrackOrderView } from "@/components/order/order-views";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-x py-8 sm:py-12">
      <TrackOrderView id={params.id} />
    </div>
  );
}
