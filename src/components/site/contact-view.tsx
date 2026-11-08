"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { telLink, whatsappLink } from "@/lib/format";
import { ContactButtons } from "./contact-buttons";

export function ContactView() {
  const { catalog } = useCatalog();
  const s = catalog.settings;
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const wa = whatsappLink(s.whatsapp, `${msg.trim()}${name.trim() ? `\n\n${name.trim()}` : ""}`);

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-2 lg:py-16">
      <div className="space-y-8">
        <ul className="space-y-6">
          <li className="flex gap-4">
            <MapPin className="mt-1 h-6 w-6 shrink-0 text-ketchup" />
            <div>
              <h2 className="font-display text-xl font-bold">Address</h2>
              <p className="text-tamarind-muted">{s.addressLine}</p>
            </div>
          </li>
          <li className="flex gap-4">
            <Phone className="mt-1 h-6 w-6 shrink-0 text-ketchup" />
            <div>
              <h2 className="font-display text-xl font-bold">Phone and WhatsApp</h2>
              {s.phone ? (
                <a href={telLink(s.phone)} className="font-semibold underline underline-offset-4">{s.phone}</a>
              ) : (
                <p className="text-tamarind-muted">Number to be added by the restaurant.</p>
              )}
            </div>
          </li>
          {s.email && (
            <li className="flex gap-4">
              <Mail className="mt-1 h-6 w-6 shrink-0 text-ketchup" />
              <div>
                <h2 className="font-display text-xl font-bold">Email</h2>
                <a href={`mailto:${s.email}`} className="font-semibold underline underline-offset-4">{s.email}</a>
              </div>
            </li>
          )}
          <li className="flex gap-4">
            <Clock className="mt-1 h-6 w-6 shrink-0 text-ketchup" />
            <div>
              <h2 className="font-display text-xl font-bold">Opening hours</h2>
              <table className="mt-1 text-tamarind-muted">
                <tbody>
                  {s.openingHours.map((h) => (
                    <tr key={h.days}>
                      <th scope="row" className="pr-6 text-left font-semibold text-tamarind">{h.days}</th>
                      <td>{h.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DemoNotice className="mt-2">Sample hours until confirmed by the restaurant.</DemoNotice>
            </div>
          </li>
        </ul>
        <ContactButtons />
        <form
          className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (wa) window.open(wa, "_blank", "noopener,noreferrer");
          }}
        >
          <h2 className="font-display text-xl font-bold">Send us a message</h2>
          <p className="text-sm text-tamarind-muted">Opens WhatsApp with your message ready to send.</p>
          <Field label="Your name" htmlFor="c-name">
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Message" htmlFor="c-msg" required>
            <Textarea id="c-msg" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} placeholder="Catering for 30 people on Friday…" />
          </Field>
          <Button type="submit" variant="success" disabled={!msg.trim() || !wa}>
            Open WhatsApp
          </Button>
          {!wa && <p className="text-sm text-tamarind-muted">WhatsApp ordering turns on once the restaurant number is added.</p>}
        </form>
      </div>
      <div className="overflow-hidden rounded-[28px] border-[3px] border-tamarind bg-white shadow-sticker lg:sticky lg:top-24 lg:self-start">
        <iframe
          title="Map of AT Naveed Fast Food, Pabbi"
          src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
          className="h-[420px] w-full lg:h-[560px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
