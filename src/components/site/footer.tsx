"use client";

import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ButtonLink } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { telLink } from "@/lib/format";

export function Footer() {
  const { catalog, categories } = useCatalog();
  const s = catalog.settings;
  const socials = [
    { href: s.socials.facebook, label: "Facebook", icon: Facebook },
    { href: s.socials.instagram, label: "Instagram", icon: Instagram },
  ].filter((x) => x.href);

  return (
    <footer className="grain relative overflow-hidden bg-char text-cream">
      <div aria-hidden className="display-xl pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[22vw] text-transparent [-webkit-text-stroke:1px_rgba(247,239,227,.06)]">AT Naveed</div>
      <div className="container-x relative border-b border-white/[.06] py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <p className="display-xl max-w-2xl text-[clamp(2.4rem,6vw,4.6rem)]">Hungry? <span className="text-gradient-fire">Order in a minute.</span></p>
          <ButtonLink href="/menu" size="lg" variant="flame" className="btn-shine px-8 uppercase tracking-wider">Order now</ButtonLink>
        </div>
      </div>
      <div className="container-x relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-cream/60">{s.tagline}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 hover:border-flame hover:bg-flame">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[.2em] text-mustard">Menu</h2>
          <ul className="mt-4 space-y-2.5 text-cream/70">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/menu/${c.slug}`} className="hover:text-flame">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[.2em] text-mustard">Help</h2>
          <ul className="mt-4 space-y-2.5 text-cream/70">
            <li><Link href="/track-order" className="hover:text-flame">Track your order</Link></li>
            <li><Link href="/offers" className="hover:text-flame">Deals and promo codes</Link></li>
            <li><Link href="/qr-menu" className="hover:text-flame">Table menu</Link></li>
            <li><Link href="/about" className="hover:text-flame">About us</Link></li>
            <li><Link href="/contact" className="hover:text-flame">Contact and location</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[.2em] text-mustard">Visit or call</h2>
          <ul className="mt-4 space-y-4 text-cream/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-flame" />
              <span>{s.addressLine}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-flame" />
              {s.phone ? <a href={telLink(s.phone)} className="hover:text-flame">{s.phone}</a> : <span>Phone number coming soon</span>}
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-flame" />
              <span>
                {s.openingHours.map((h) => (
                  <span key={h.days} className="block">
                    <span className="text-white">{h.days}:</span> {h.hours}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/[.06]">
        <div className="container-x flex flex-col gap-2 py-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {s.name}. Pabbi, Khyber Pakhtunkhwa.</p>
          <DemoNotice className="!text-white/40">Demo build: hours, ratings and reviews are sample content until confirmed by the restaurant.</DemoNotice>
        </div>
      </div>
    </footer>
  );
}
