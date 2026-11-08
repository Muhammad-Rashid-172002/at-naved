"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One lightweight engine for every scroll effect on the customer site:
 *  - [data-reveal]            fades/slides elements in once (IntersectionObserver, no scroll listeners)
 *  - [data-reveal-delay="120"] staggers them
 *  - [data-parallax="0.15"]   moves elements with scroll (single rAF loop, transform only, GPU friendly)
 * Fully disabled for prefers-reduced-motion.
 */
export function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const d = el.dataset.revealDelay;
            if (d) el.style.setProperty("--reveal-delay", `${d}ms`);
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const parallax = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const pio = new IntersectionObserver((entries) => {
      for (const e of entries) (e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement));
    });

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        if (!parallax.has(el)) {
          parallax.add(el);
          pio.observe(el);
        }
      });
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      visible.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0");
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      io.disconnect();
      pio.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
