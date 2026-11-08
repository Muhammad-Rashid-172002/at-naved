"use client";

import { Tag } from "lucide-react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { OfferCard } from "./offer-card";

export function OffersList() {
  const { activeOffers, getProduct } = useCatalog();
  const offers = activeOffers.filter((o) => !o.productId || getProduct(o.productId));
  if (!offers.length)
    return <EmptyState icon={Tag} title="No deals running right now" body="Check back soon, or order from the full menu." action={<ButtonLink href="/menu">See the menu</ButtonLink>} />;
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {offers.map((o) => (
        <OfferCard key={o.id} offer={o} />
      ))}
    </div>
  );
}
