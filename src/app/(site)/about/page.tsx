import type { Metadata } from "next";
import { ContactButtons } from "@/components/site/contact-buttons";
import { ButtonLink } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { PageHeader } from "@/components/ui/misc";
import { whyUs } from "@/config/content";

export const metadata: Metadata = {
  title: "About us",
  description: "AT Naveed Fast Food is a fast-food restaurant in Pabbi, Khyber Pakhtunkhwa, serving burgers, pizza, shawarma and fried chicken.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About AT Naveed" intro="A fast-food kitchen in Pabbi, cooking for families, students and late-night cravings." />
      <div className="container-x grid gap-12 py-12 lg:grid-cols-[1.2fr_1fr] lg:py-16">
        <div className="max-w-[65ch] space-y-5 text-lg text-tamarind-soft">
          <p>
            AT Naveed Fast Food serves the food Pabbi loves to eat on a busy day: crispy zinger burgers, shawarma rolled to order,
            loaded pizza and golden fried chicken.
          </p>
          <p>
            Every order is made when you place it. Chicken is marinated ahead and breaded fresh, fries go into the oil when your
            ticket comes in, and nothing waits under a heat lamp.
          </p>
          <p>Order for delivery, collect it yourself, or scan the code on your table and order straight from your seat.</p>
          <DemoNotice>Demo copy. Replace with the restaurant’s own story, founding year and photos.</DemoNotice>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/menu" size="lg">
              See the menu
            </ButtonLink>
          </div>
        </div>
        <ul className="grid gap-6 self-start sm:grid-cols-2 lg:grid-cols-1">
          {whyUs.map((w) => (
            <li key={w.title} className="border-l-[3px] border-mustard-dark pl-4">
              <h2 className="font-display text-xl font-bold">{w.title}</h2>
              <p className="mt-1 text-tamarind-muted">{w.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <section className="bg-mustard-soft py-12">
        <div className="container-x flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl font-extrabold">Questions or a large order?</h2>
          <ContactButtons />
        </div>
      </section>
    </>
  );
}
