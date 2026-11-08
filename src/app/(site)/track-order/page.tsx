import type { Metadata } from "next";
import { RecentOrders } from "@/components/order/order-views";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };

export default function TrackOrdersPage() {
  return (
    <>
      <PageHeader title="Track your order" intro="Orders placed from this phone or computer appear below. Tap one to see where it is." />
      <div className="container-x max-w-3xl py-10">
        <RecentOrders />
      </div>
    </>
  );
}
