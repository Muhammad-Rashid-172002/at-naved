"use client";

import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useCart } from "@/components/providers/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { navLinks } from "@/config/content";
import { cn } from "@/lib/cn";

export function CartButton({ className }: { className?: string }) {
  const { totals, bumpKey, hydrated } = useCart();
  const count = hydrated ? totals.itemCount : 0;
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      data-cart-target
      className={cn("relative grid h-11 w-11 place-items-center rounded-full bg-cream text-char transition hover:bg-mustard", className)}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span
          key={bumpKey}
          className="absolute -right-1 -top-1 grid h-6 min-w-6 animate-bump place-items-center rounded-full border-2 border-char bg-flame px-1 text-xs font-extrabold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const overHero = pathname === "/" && !scrolled && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 text-cream transition-[background-color,border-color,backdrop-filter] duration-500",
        overHero ? "border-b border-transparent bg-transparent" : "border-b border-white/[.06] bg-char/85 backdrop-blur-xl",
      )}
    >
      <nav className="container-x flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <Link href="/" aria-label="AT Naveed Fast Food home" className="shrink-0">
          <Logo tone="light" />
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[14px] font-bold uppercase tracking-[.08em] text-cream/75 transition hover:text-cream",
                  "after:absolute after:inset-x-4 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-flame after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive(l.href) && "text-cream after:scale-x-100",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ButtonLink href="/menu" size="sm" variant="flame" className="btn-shine hidden h-11 px-5 uppercase tracking-wider sm:inline-flex">
            Order now
          </ButtonLink>
          <CartButton />
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-cream lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[72px] z-40 animate-fade-in overflow-y-auto bg-char lg:hidden">
          <ul className="container-x flex flex-col py-4">
            {[{ href: "/", label: "Home" }, ...navLinks].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "flex items-center justify-between border-b border-white/10 py-4 font-display text-3xl font-extrabold uppercase tracking-tight text-cream",
                    (l.href === "/" ? pathname === "/" : isActive(l.href)) && "text-flame",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="container-x pb-10">
            <ButtonLink href="/menu" size="lg" variant="flame" className="w-full">
              Order now
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
