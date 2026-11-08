"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ButtonLink } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/format";

type Tone = "default" | "onDark";

/** WhatsApp + Call buttons. Falls back to the contact page until real numbers are configured. */
export function ContactButtons({ message, tone = "default", size = "md" }: { message?: string; tone?: Tone; size?: "md" | "lg" }) {
  const { catalog } = useCatalog();
  const { whatsapp, phone } = catalog.settings;
  const wa = whatsappLink(whatsapp, message ?? `Assalam o Alaikum! I'd like to place an order from ${catalog.settings.name}.`);
  const tel = telLink(phone);
  return (
    <div className="flex flex-wrap gap-3">
      <ButtonLink href={wa || "/contact"} size={size} variant="success" aria-label="Order on WhatsApp">
        <MessageCircle className="h-5 w-5" />
        Order on WhatsApp
      </ButtonLink>
      <ButtonLink href={tel || "/contact"} size={size} variant={tone === "onDark" ? "light" : "outline"} aria-label="Call the restaurant">
        <Phone className="h-5 w-5" />
        Call now
      </ButtonLink>
    </div>
  );
}
