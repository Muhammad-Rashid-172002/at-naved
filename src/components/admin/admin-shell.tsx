"use client";

import {
  BarChart3,
  ChefHat,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  QrCode,
  Receipt,
  Settings,
  Tag,
  Tags,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { useOrders } from "@/hooks/use-orders";
import { signOutAdmin } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { dataMode } from "@/lib/env";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/kitchen", label: "Kitchen screen", icon: ChefHat },
  { href: "/admin/menu", label: "Menu items", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/qr", label: "QR codes", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ pending, onNavigate }: { pending: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <ul className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
              isActive(href) ? "bg-mustard text-tamarind" : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1">{label}</span>
            {href === "/admin/orders" && pending > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ketchup px-1.5 text-xs font-extrabold text-white">{pending}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { orders } = useOrders();
  const pending = orders.filter((o) => o.status === "pending").length;

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await signOutAdmin();
    router.replace("/admin/login");
    router.refresh();
  };

  const footer = (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
          dataMode === "demo" ? "bg-mustard/20 text-mustard" : "bg-mint/30 text-white",
        )}
      >
        {dataMode === "demo" ? "Demo mode: data in this browser" : "Live: Supabase"}
      </span>
      <Link href="/" target="_blank" className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
        <ExternalLink className="h-4 w-4" /> View website
      </Link>
      <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper-warm">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-tamarind p-4 lg:flex">
        <Link href="/admin" className="mb-8 px-2 pt-2">
          <Logo tone="light" />
        </Link>
        <nav className="flex-1 overflow-y-auto" aria-label="Admin">
          <NavList pending={pending} />
        </nav>
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin">
          <Logo compact />
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="grid h-11 w-11 place-items-center rounded-full border border-line">
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-tamarind/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 animate-fade-in flex-col bg-tamarind p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo tone="light" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-white hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto" aria-label="Admin">
              <NavList pending={pending} onNavigate={() => setOpen(false)} />
            </nav>
            {footer}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

export function AdminTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-tamarind-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 ring-1 ring-line", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: typeof Receipt }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-tamarind-muted">{label}</p>
        <Icon className="h-5 w-5 text-tamarind-muted" />
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-tamarind-muted">{hint}</p>}
    </div>
  );
}
