"use client";

import { ArrowDown, ArrowRight, Bike, Plus, Star, Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { flyToCart } from "@/components/fx/fly-to-cart";
import { Tilt } from "@/components/fx/tilt";
import { useCart } from "@/components/providers/cart-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ButtonLink } from "@/components/ui/button";
import { FoodImage } from "@/components/ui/food-image";
import { HERO_IMAGE, photo } from "@/config/images";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/** Only load WebGL where it will be smooth: wide screens, fine pointer, no reduced-motion, after first paint. */
function useDesktop3D() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ok =
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      (navigator.hardwareConcurrency ?? 4) >= 4;
    if (!ok) return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(() => setOn(true)) : window.setTimeout(() => setOn(true), 900);
    return () => window.clearTimeout(id);
  }, []);
  return on;
}

const floaters = [
  { key: photo("regular-fries"), label: "Golden fries", cls: "left-[-4%] top-[12%] h-20 w-20 sm:h-28 sm:w-28", speed: "0.12", delay: "0s", r: "-8deg" },
  { key: photo("pizza-cheese-pull"), label: "Cheese pull", cls: "right-[-2%] bottom-[18%] h-24 w-24 sm:h-32 sm:w-32", speed: "0.2", delay: "-2s", r: "10deg" },
  { key: photo("chicken-wings"), label: "Crispy wings", cls: "left-[6%] bottom-[2%] h-16 w-16 sm:h-24 sm:w-24", speed: "0.28", delay: "-4s", r: "6deg" },
];

export function Hero() {
  const { catalog, getProduct } = useCatalog();
  const { add } = useCart();
  const { show } = useToast();
  const s = catalog.settings;
  const star = getProduct("classic-zinger") ?? catalog.products.find((p) => p.featured);
  const three = useDesktop3D();
  const imgRef = useRef<HTMLDivElement>(null);

  return (
    <section className="grain relative isolate -mt-[72px] overflow-hidden bg-char pt-[72px] text-cream">
      {/* Lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[-10%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,91,31,.38),rgba(255,91,31,0)_70%)] animate-glow-pulse" />
        <div className="absolute left-[-20%] bottom-[-30%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,194,26,.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,8,0)_60%,#0E0A08)]" />
      </div>
      <div
        aria-hidden
        className="display-xl pointer-events-none absolute inset-x-0 bottom-[-0.08em] -z-10 select-none text-center text-[27vw] text-transparent [-webkit-text-stroke:1px_rgba(247,239,227,.07)]"
      >
        Naveed
      </div>
      {three && (
        <div className="absolute inset-0 -z-10 animate-fade-in">
          <HeroScene />
        </div>
      )}

      <div className="container-x relative grid min-h-[calc(100svh-72px)] items-center gap-6 pb-16 pt-6 lg:grid-cols-[1.02fr_1fr] lg:gap-4 lg:pb-20">
        <div className="order-2 lg:order-1">
          <p className="eyebrow animate-rise-in">AT Naveed · Pabbi, KPK</p>
          <h1 className="display-xl mt-5 text-[clamp(3.4rem,11vw,8.4rem)]">
            <span className="block animate-rise-in [animation-delay:.08s]">Cravings</span>
            <span className="block animate-rise-in [animation-delay:.16s]">Made</span>
            <span className="text-gradient-fire block animate-rise-in pb-2 [animation-delay:.24s]">Fresh.</span>
          </h1>
          <p className="mt-5 max-w-md animate-rise-in text-lg text-cream/70 [animation-delay:.32s] sm:text-xl">
            Freshly prepared. Deliciously served. Your favourite food, just a few clicks away.
          </p>
          <div className="mt-8 flex animate-rise-in flex-wrap gap-3 [animation-delay:.4s]">
            <ButtonLink href="/menu" size="lg" variant="flame" className="btn-shine px-8 tracking-wide">
              ORDER NOW <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/menu#categories" size="lg" variant="glass" className="px-8 tracking-wide">
              EXPLORE MENU
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-lg animate-rise-in grid-cols-3 gap-3 [animation-delay:.48s]">
            {[
              { icon: Star, k: "Rating", v: "4.8 / 5" },
              { icon: Bike, k: "Delivery", v: `~${s.estimatedDeliveryMins} min` },
              { icon: Wallet, k: "Payment", v: "Cash on delivery" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/[.03] px-3 py-3 sm:px-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/50">
                  <Icon className="h-3.5 w-3.5 text-mustard" aria-hidden /> {k}
                </dt>
                <dd className="mt-1 text-sm font-bold sm:text-base">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The hero burger */}
        <div className="relative order-1 mx-auto w-full max-w-[360px] sm:max-w-[480px] lg:order-2 lg:max-w-[620px]">
          <div className="relative aspect-square animate-blur-in">
            <div aria-hidden className="absolute inset-[4%] animate-spin-slow rounded-full border border-dashed border-mustard/25" />
            <div aria-hidden className="absolute inset-[13%] rounded-full bg-[radial-gradient(closest-side,rgba(255,140,40,.45),transparent)] blur-2xl" />
            <Tilt max={10} className="absolute inset-[8%]">
              <div ref={imgRef} className="absolute inset-0 animate-float-slow">
                <div className="relative h-full w-full [mask-image:radial-gradient(closest-side,#000_70%,transparent_100%)]">
                  <FoodImage src={HERO_IMAGE} alt="AT Naveed signature burger with every layer stacked in the air" priority quality={80} sizes="(max-width: 1024px) 90vw, 620px" />
                </div>
              </div>
            </Tilt>
            {floaters.map((f) => (
              <div key={f.label} data-parallax={f.speed} className={`absolute ${f.cls}`}>
                <div className="relative h-full w-full animate-float overflow-hidden rounded-full shadow-float ring-2 ring-white/15" style={{ animationDelay: f.delay, ["--r" as string]: f.r }}>
                  <FoodImage src={f.key} alt={f.label} sizes="128px" />
                </div>
              </div>
            ))}
            {star && (
              <div className="glass-dark absolute right-0 top-[6%] flex items-center gap-3 rounded-2xl py-2.5 pl-3 pr-2.5 shadow-premium sm:right-[2%]">
                <div className="leading-tight">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cream/50">Bestseller</p>
                  <p className="text-sm font-bold">{star.name}</p>
                  <p className="font-display text-lg font-extrabold text-mustard">{formatPrice(effectivePrice(star))}</p>
                </div>
                <button
                  type="button"
                  data-no-tilt
                  onClick={() => {
                    add(star);
                    flyToCart(imgRef.current);
                    show(`${star.name} added to cart`);
                  }}
                  disabled={!star.available}
                  aria-label={`Add ${star.name} to cart`}
                  className="grid h-11 w-11 place-items-center rounded-full bg-flame text-white shadow-glow transition hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <a href="#categories" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[.25em] text-cream/40 hover:text-cream/70 lg:flex">
        Scroll <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

const words = ["Zinger burgers", "Hot pizza", "Chicken shawarma", "Crispy wings", "Loaded fries", "Thick shakes", "Family buckets"];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-flame py-4 text-char" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span className="text-mustard">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
