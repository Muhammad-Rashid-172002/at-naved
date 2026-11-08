import type { Metadata } from "next";
import { ContactView } from "@/components/site/contact-view";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Contact and location",
  description: "Find AT Naveed Fast Food in Pabbi, Khyber Pakhtunkhwa. Opening hours, phone, WhatsApp ordering and directions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact and location" intro="Message us on WhatsApp, call for large orders, or visit us in Pabbi." />
      <ContactView />
    </>
  );
}
