import { Star, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-tamarind/[.06]", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-mustard-soft text-tamarind">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-tamarind-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-bold text-tamarind", className)}>
      <Star className="h-4 w-4 fill-mustard text-mustard-dark" aria-hidden />
      <span>{value.toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-mustard-soft">
      <div className="container-x py-10 sm:py-14">
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-tamarind sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-tamarind-soft">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
