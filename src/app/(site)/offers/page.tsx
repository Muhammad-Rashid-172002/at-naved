import type { Metadata } from "next";
import { OffersList } from "@/components/offers/offers-list";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Deals and offers",
  description: "Current deals at AT Naveed Fast Food, Pabbi: combo meals, family feasts and promo codes for online orders.",
  alternates: { canonical: "/offers" },
};

export default function OffersPage() {
  return (
    <>
      <PageHeader title="Deals and offers" intro="Combos are added straight to your cart. Promo codes are applied at checkout." />
      <div className="container-x py-10 pb-20">
        <OffersList />
      </div>
    </>
  );
}
