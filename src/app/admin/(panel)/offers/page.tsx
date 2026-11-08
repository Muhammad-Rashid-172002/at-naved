import type { Metadata } from "next";
import { OfferManager } from "@/components/admin/offer-manager";

export const metadata: Metadata = { title: "Offers" };

export default function AdminOffersPage() {
  return <OfferManager />;
}
