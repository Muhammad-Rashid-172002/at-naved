import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Menu: Burgers, Pizza, Shawarma & Deals",
  description: "Full menu of AT Naveed Fast Food in Pabbi. Zinger burgers, pizza, shawarma, fried chicken, fries, drinks and family deals with prices.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <>
      <PageHeader title="Our menu" intro="Everything is made to order. Prices include tax." />
      <div className="container-x pb-20">
        <MenuBrowser />
      </div>
    </>
  );
}
