"use client";

import { ArrowRight, ArrowUpRight, Flame, Leaf, Quote, Sparkles, Star, Timer, Wallet } from "lucide-react";
import Link from "next/link";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ProductCard } from "@/components/menu/product-card";
import { ContactButtons } from "@/components/site/contact-buttons";
import { ButtonLink } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { FoodImage } from "@/components/ui/food-image";
import { howItWorks, reviews, whyUs } from "@/config/content";
import { photo } from "@/config/images";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { OfferCard } from "@/components/offers/offer-card";

export function SectionHead({
  eyebrow,
  title,
  intro,
  link,
  tone = "light",
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
  tone?: "light" | "dark";
  id?: string;
}) {
  return (
    <div data-reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className={cn("title-lg mt-3", tone === "dark" ? "text-cream" : "text-char")}>
          {title}
        </h2>
        {intro && <p className={cn("mt-3 max-w-xl text-lg", tone === "dark" ? "text-cream/60" : "text-tamarind-muted")}>{intro}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold uppercase tracking-wider transition",
            tone === "dark" ? "border-white/15 text-cream hover:border-flame hover:bg-flame" : "border-char/15 text-char hover:border-char hover:bg-char hover:text-cream",
          )}
        >
          {link.label} <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export function CategoryStrip() {
  const { categories, productsIn } = useCatalog();
  return (
    <section id="categories" className="scroll-mt-20 bg-cream-soft py-16 sm:py-24" aria-labelledby="cats">
      <div className="container-x">
        <SectionHead id="cats" eyebrow="The menu" title="What are you craving?" link={{ href: "/menu", label: "Full menu" }} />
        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          {categories.map((c, i) => (
            <li key={c.id} data-reveal data-reveal-delay={i * 60} className={cn("w-[44%] shrink-0 snap-start sm:w-auto", i === 0 && "sm:col-span-2 lg:col-span-1")}>
              <Link
                href={`/menu/${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[24px] bg-char shadow-card ring-1 ring-black/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-float"
              >
                <FoodImage src={c.image} alt="" sizes="(max-width: 640px) 45vw, 220px" className="duration-[1100ms] group-hover:scale-110" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-char via-char/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block font-display text-xl font-extrabold leading-none tracking-tight text-cream">{c.name}</span>
                  <span className="mt-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cream/60">
                    {productsIn(c.id).length} items
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-flame text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <ArrowRight className="h-4 w-4 -translate-x-1 transition duration-300 group-hover:translate-x-0" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Popular                                                              */
/* ------------------------------------------------------------------ */

export function PopularItems() {
  const { visibleProducts } = useCatalog();
  const featured = visibleProducts.filter((p) => p.featured && p.available).slice(0, 8);
  if (!featured.length) return null;
  return (
    <section className="bg-cream-soft pb-20 sm:pb-28" aria-labelledby="popular">
      <div className="container-x">
        <SectionHead id="popular" eyebrow="Most ordered" title="Pabbi’s favourites" intro="The ones our regulars come back for, every single week." link={{ href: "/menu", label: "See all" }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <div key={p.id} data-reveal data-reveal-delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial food showcase                                              */
/* ------------------------------------------------------------------ */

export function FoodShowcase() {
  return (
    <section className="grain relative overflow-hidden bg-char py-20 text-cream sm:py-28" aria-labelledby="showcase">
      <div className="container-x">
        <SectionHead id="showcase" tone="dark" eyebrow="Made to order" title="Every bite, built properly." intro="No heat lamps. No shortcuts. Just fresh food that looks as good as it tastes." />
      </div>

      {/* 1 — Burger: split editorial */}
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div data-reveal="left" className="order-2 lg:order-1">
          <p className="font-display text-sm font-bold uppercase tracking-[.3em] text-mustard">01 — Burgers</p>
          <h3 className="display-xl mt-4 text-[clamp(3rem,8vw,6.5rem)]">
            Stacked
            <br />
            <span className="text-gradient-fire">high.</span>
          </h3>
          <p className="mt-5 max-w-md text-lg text-cream/65">
            Hand-breaded zinger fillets and smashed beef patties, layered with melted cheddar and our signature sauces in toasted buns.
          </p>
          <ButtonLink href="/menu/burgers" variant="flame" size="lg" className="btn-shine mt-8 uppercase tracking-wider">
            Order burgers <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
        <div data-reveal="right" className="relative order-1 aspect-[4/3] overflow-hidden rounded-[32px] lg:order-2 lg:aspect-[5/4]">
          <div data-parallax="0.08" className="absolute -inset-[8%]">
            <FoodImage src={photo("double-beef-burger")} alt="Double beef burger with melted cheese" sizes="(max-width: 1024px) 100vw, 55vw" quality={78} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-char/50 via-transparent to-transparent" />
          <span className="glass-dark absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
            <Flame className="h-4 w-4 text-flame" /> Grilled to order
          </span>
        </div>
      </div>

      {/* 2 — Fried chicken: full-bleed cinematic */}
      <div className="relative mt-24 h-[70vh] min-h-[460px] overflow-hidden sm:mt-32">
        <div data-parallax="0.12" className="absolute -inset-y-[12%] inset-x-0">
          <FoodImage src={photo("fried-chicken")} alt="Golden crispy fried chicken" sizes="100vw" quality={78} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-char via-char/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-char via-transparent to-char/60" />
        <div className="container-x relative flex h-full items-center">
          <div data-reveal className="max-w-xl">
            <p className="font-display text-sm font-bold uppercase tracking-[.3em] text-mustard">02 — Fried chicken</p>
            <h3 className="display-xl mt-4 text-[clamp(3rem,8vw,6.5rem)]">
              Crunch
              <br />
              you can <span className="text-gradient-fire">hear.</span>
            </h3>
            <p className="mt-5 max-w-md text-lg text-cream/70">Marinated overnight, double-breaded and fried golden in fresh oil. Wings, strips, nuggets and buckets for the whole family.</p>
            <ButtonLink href="/menu/fried-chicken" variant="glass" size="lg" className="mt-8 uppercase tracking-wider">
              Get the crunch <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* 3 — Pizza: rotating hero plate */}
      <div className="container-x mt-24 grid items-center gap-12 sm:mt-32 lg:grid-cols-2">
        <div data-reveal="scale" className="relative mx-auto aspect-square w-full max-w-[540px]">
          <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,91,31,.35),transparent)] blur-2xl" />
          <div className="absolute inset-[6%] animate-[spin-slow_60s_linear_infinite] overflow-hidden rounded-full shadow-float ring-1 ring-white/10 motion-reduce:animate-none">
            <FoodImage src={photo("pepperoni-pizza")} alt="Pepperoni pizza, fresh from the oven" sizes="(max-width: 1024px) 90vw, 540px" quality={78} />
          </div>
          <div data-parallax="0.18" className="absolute -right-2 bottom-[8%] h-32 w-32 sm:h-44 sm:w-44">
            <div className="relative h-full w-full animate-float overflow-hidden rounded-[28px] shadow-float ring-4 ring-char">
              <FoodImage src={photo("pizza-cheese-pull")} alt="Cheese pull" sizes="180px" />
            </div>
          </div>
        </div>
        <div data-reveal="right">
          <p className="font-display text-sm font-bold uppercase tracking-[.3em] text-mustard">03 — Pizza</p>
          <h3 className="display-xl mt-4 text-[clamp(3rem,8vw,6.5rem)]">
            Pull it
            <br />
            <span className="text-gradient-fire">apart.</span>
          </h3>
          <p className="mt-5 max-w-md text-lg text-cream/65">Hand-stretched dough, rich tomato sauce and a serious layer of mozzarella. Tikka, fajita, pepperoni and our cheese-stuffed special.</p>
          <ButtonLink href="/menu/pizza" variant="flame" size="lg" className="btn-shine mt-8 uppercase tracking-wider">
            Order pizza <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
      </div>

      {/* 4 + 5 — Fries & shawarma: twin panels */}
      <div className="container-x mt-24 grid gap-5 sm:mt-32 md:grid-cols-2">
        {[
          { href: "/menu/fries-sides", img: photo("loaded-fries"), n: "04 — Fries", t: "Loaded to the top.", b: "Cheese sauce, crispy chicken and jalapeños." },
          { href: "/menu/shawarma", img: photo("chicken-shawarma"), n: "05 — Shawarma", t: "Rolled to order.", b: "Juicy chicken, garlic sauce, fresh pita." },
        ].map((x, i) => (
          <Link key={x.href} href={x.href} data-reveal data-reveal-delay={i * 120} className="group relative block aspect-[4/5] overflow-hidden rounded-[32px] sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4]">
            <FoodImage src={x.img} alt="" sizes="(max-width: 768px) 100vw, 50vw" className="duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-char via-char/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-xs font-bold uppercase tracking-[.3em] text-mustard">{x.n}</p>
              <p className="display-xl mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)]">{x.t}</p>
              <p className="mt-2 flex items-center justify-between gap-4 text-cream/70">
                {x.b}
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream text-char transition duration-300 group-hover:rotate-[-45deg] group-hover:bg-flame group-hover:text-white">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Offers                                                               */
/* ------------------------------------------------------------------ */

export function OffersPreview() {
  const { activeOffers } = useCatalog();
  if (!activeOffers.length) return null;
  return (
    <section className="relative overflow-hidden bg-char-2 py-20 text-cream sm:py-24" aria-labelledby="offers-h">
      <div aria-hidden className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(255,194,26,.14),transparent)]" />
      <div className="container-x relative">
        <SectionHead id="offers-h" tone="dark" eyebrow="Deals" title="Deals running now" intro="Combos, promo codes and automatic discounts." link={{ href: "/offers", label: "All deals" }} />
        <div className="grid gap-5 md:grid-cols-3">
          {activeOffers.slice(0, 3).map((o, i) => (
            <div key={o.id} data-reveal data-reveal-delay={i * 100}>
              <OfferCard offer={o} tone="dark" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why us + how it works                                                */
/* ------------------------------------------------------------------ */

const whyIcons = [Leaf, Timer, Wallet, Sparkles];

export function WhyUs() {
  return (
    <section className="bg-cream-soft py-20 sm:py-28" aria-labelledby="why">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div data-reveal="left" className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-float">
            <FoodImage src={photo("burger-moody")} alt="Burger and fries on a dark plate" sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
          <div className="absolute -bottom-6 -right-2 rounded-[24px] bg-char p-5 text-cream shadow-float sm:-right-6 sm:p-6">
            <p className="font-display text-5xl font-extrabold leading-none text-gradient-fire">15</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wider text-cream/60">minutes, kitchen to bag</p>
          </div>
        </div>
        <div>
          <SectionHead id="why" eyebrow="Why AT Naveed" title="Simple promises, kept on every order." />
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {whyUs.map((w, i) => {
              const Icon = whyIcons[i % whyIcons.length];
              return (
                <li key={w.title} data-reveal data-reveal-delay={i * 80}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-char text-mustard">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-char">{w.title}</h3>
                  <p className="mt-1.5 text-tamarind-muted">{w.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="border-t border-line bg-cream py-20 sm:py-24" aria-labelledby="how">
      <div className="container-x">
        <SectionHead id="how" eyebrow="How it works" title="From craving to doorstep." />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((s, i) => (
            <li key={s.title} data-reveal data-reveal-delay={i * 90} className="group relative overflow-hidden rounded-[26px] bg-white p-6 shadow-card ring-1 ring-black/[.04] transition duration-500 hover:-translate-y-1 hover:shadow-float">
              <span className="font-display text-7xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_#FF5B1F]">0{i + 1}</span>
              <h3 className="mt-5 font-display text-xl font-bold text-char">{s.title}</h3>
              <p className="mt-1.5 text-tamarind-muted">{s.body}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-mustard to-flame transition-transform duration-500 group-hover:scale-x-100" />
            </li>
          ))}
        </ol>
        <ButtonLink href="/menu" size="lg" variant="dark" className="mt-10 uppercase tracking-wider">
          Choose your food <ArrowRight className="h-5 w-5" />
        </ButtonLink>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews                                                              */
/* ------------------------------------------------------------------ */

export function Reviews() {
  return (
    <section className="bg-cream-soft py-20 sm:py-24" aria-labelledby="reviews">
      <div className="container-x">
        <SectionHead id="reviews" eyebrow="Reviews" title="What customers say" />
        <DemoNotice className="-mt-6 mb-8">Sample reviews for the demo. Replace with real customer feedback.</DemoNotice>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <figure key={r.name} data-reveal data-reveal-delay={i * 80} className="flex w-[82%] shrink-0 snap-start flex-col rounded-[26px] bg-white p-6 shadow-card ring-1 ring-black/[.04] sm:w-auto">
              <span className="flex" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={k < r.rating ? "h-4 w-4 fill-mustard text-mustard-dark" : "h-4 w-4 text-tamarind/20"} />
                ))}
              </span>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-tamarind-soft">“{r.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-char font-display font-bold text-mustard">{r.name[0]}</span>
                <span>
                  <span className="block font-bold text-char">{r.name}</span>
                  <span className="text-sm text-tamarind-muted">{r.area}</span>
                </span>
                <Quote className="ml-auto h-6 w-6 text-flame/30" aria-hidden />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Location + closing                                                   */
/* ------------------------------------------------------------------ */

export function LocationSection() {
  const { catalog } = useCatalog();
  const s = catalog.settings;
  return (
    <section className="bg-cream py-20 sm:py-24" aria-labelledby="visit">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2">
        <div data-reveal="left">
          <p className="eyebrow">Visit or order</p>
          <h2 id="visit" className="title-lg mt-3 text-char">Hungry right now?</h2>
          <p className="mt-4 max-w-md text-lg text-tamarind-muted">Order online, message us on WhatsApp or give us a call. We deliver across Pabbi and nearby areas.</p>
          <p className="mt-6 font-bold text-char">{s.addressLine}</p>
          <ul className="mt-2 space-y-1 text-tamarind-muted">
            {s.openingHours.map((h) => (
              <li key={h.days}>
                {h.days}: <span className="font-semibold text-char">{h.hours}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ContactButtons />
          </div>
          {s.minOrder > 0 && <p className="mt-4 text-sm text-tamarind-muted">Minimum delivery order {formatPrice(s.minOrder)}.</p>}
        </div>
        <div data-reveal="right" className="overflow-hidden rounded-[32px] bg-white shadow-float ring-1 ring-black/5">
          <iframe
            title="Map showing AT Naveed Fast Food in Pabbi"
            src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
            className="h-[360px] w-full grayscale-[.3]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-flame text-white">
      <div className="container-x relative grid items-center gap-6 py-14 sm:py-16 md:grid-cols-[1.3fr_1fr]">
        <div data-reveal>
          <p className="display-xl text-[clamp(2.4rem,6vw,4.8rem)] text-char">
            Your zinger is
            <br />
            <span className="text-white">15 minutes away.</span>
          </p>
          <ButtonLink href="/menu" variant="dark" size="lg" className="mt-8 px-8 uppercase tracking-wider">
            Start your order <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
        <div data-parallax="0.1" className="relative mx-auto hidden aspect-square w-full max-w-[380px] md:block">
          <div className="relative h-full w-full animate-float-slow overflow-hidden rounded-full shadow-float ring-8 ring-white/15">
            <FoodImage src={photo("classic-zinger")} alt="Classic zinger burger" sizes="380px" />
          </div>
        </div>
      </div>
    </section>
  );
}
