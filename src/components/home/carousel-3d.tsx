"use client";

import { Move3d } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import { FoodImage } from "@/components/ui/food-image";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";

/**
 * Slowly rotating 3D ring of real food photos (CSS 3D transforms — GPU composited, no WebGL needed).
 * Drag or swipe to spin; pauses on hover and when off-screen; static for reduced-motion.
 */
export function FoodCarousel3D() {
  const { visibleProducts, getProduct } = useCatalog();
  const ids = ["classic-zinger", "chicken-tikka-pizza", "chicken-shawarma", "hot-wings", "loaded-fries", "beef-smash", "chocolate-shake", "chicken-bucket", "crown-crust-pizza", "zinger-shawarma"];
  const items = ids.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => !!p && visibleProducts.includes(p));
  const ring = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const state = useRef({ angle: 0, vel: 0.08, dragging: false, lastX: 0, hover: false, visible: true, moved: 0 });
  const [radius, setRadius] = useState(420);
  const n = items.length;

  useEffect(() => {
    const update = () => setRadius(window.innerWidth < 640 ? 230 : window.innerWidth < 1024 ? 340 : 470);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = state.current;
    const io = new IntersectionObserver(([e]) => (s.visible = e.isIntersecting));
    if (stage.current) io.observe(stage.current);
    let raf = 0;
    const loop = () => {
      if (s.visible) {
        if (!s.dragging) {
          const target = reduce || s.hover ? 0 : 0.08;
          s.vel += (target - s.vel) * 0.03;
          s.angle += s.vel;
        }
        if (ring.current) ring.current.style.transform = `translateZ(${-radius}px) rotateY(${s.angle}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [radius]);

  if (n < 4) return null;

  const onDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.moved = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.moved += Math.abs(dx);
    s.vel = dx * 0.25;
    s.angle += dx * 0.25;
  };
  const onUp = () => (state.current.dragging = false);

  return (
    <section className="grain relative overflow-hidden bg-char py-20 text-cream sm:py-28" aria-labelledby="lineup">
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,91,31,.22),transparent)]" />
      <div className="container-x relative text-center">
        <p data-reveal className="eyebrow justify-center">The line-up</p>
        <h2 id="lineup" data-reveal className="title-lg mt-3">
          Spin the <span className="text-gradient-fire">menu.</span>
        </h2>
        <p data-reveal className="mx-auto mt-3 max-w-md text-cream/60">
          <Move3d className="mr-1 inline h-4 w-4 align-[-2px] text-mustard" /> Drag to spin. Tap a dish to see it.
        </p>
      </div>
      <div
        ref={stage}
        className="relative mx-auto mt-6 h-[360px] touch-pan-y select-none sm:h-[460px] lg:h-[520px]"
        style={{ perspective: "1400px" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => {
          onUp();
          state.current.hover = false;
        }}
        onPointerEnter={() => (state.current.hover = true)}
      >
        <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          {items.map((p, i) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              draggable={false}
              onClick={(e) => state.current.moved > 8 && e.preventDefault()}
              className="group absolute -left-[95px] -top-[130px] h-[260px] w-[190px] overflow-hidden rounded-[26px] bg-char-3 shadow-float ring-1 ring-white/10 [backface-visibility:hidden] sm:-left-[120px] sm:-top-[165px] sm:h-[330px] sm:w-[240px]"
              style={{ transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)` }}
            >
              <FoodImage src={p.image} alt={p.name} sizes="240px" className="pointer-events-none duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-char via-char/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-left">
                <span className="block font-display text-lg font-extrabold leading-tight">{p.name}</span>
                <span className="mt-1 block text-sm font-bold text-mustard">{formatPrice(effectivePrice(p))}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
