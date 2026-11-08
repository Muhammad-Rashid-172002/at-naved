import type { Metadata } from "next";
import { OrderDetail } from "@/components/admin/order-detail";

export const metadata: Metadata = { title: "Order details" };

export default function AdminOrderPage({ params }: { params: { id: string } }) {
  return <OrderDetail id={params.id} />;
}
