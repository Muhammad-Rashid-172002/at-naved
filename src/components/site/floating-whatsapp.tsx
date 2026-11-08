"use client";

import { MessageCircle } from "lucide-react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { whatsappLink } from "@/lib/format";

export function FloatingWhatsApp() {
  const { catalog } = useCatalog();
  const href = whatsappLink(catalog.settings.whatsapp, `Assalam o Alaikum! I'd like to order from ${catalog.settings.name}.`);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105 md:grid"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
