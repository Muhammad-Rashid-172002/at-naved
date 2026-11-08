import { cn } from "@/lib/cn";

/** Brand mark: flame-gradient "AT" monogram + NAVEED wordmark. */
export function Logo({ tone = "dark", compact = false, className }: { tone?: "dark" | "light"; compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="AT Naveed Fast Food">
      <span
        aria-hidden
        className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[12px] bg-gradient-to-br from-mustard via-[#FF8A1F] to-flame font-display text-[16px] font-extrabold leading-none tracking-tight text-char shadow-[0_8px_20px_-8px_rgba(255,91,31,.8)]"
      >
        <span className="absolute inset-x-0 top-0 h-1/2 bg-white/25" />
        <span className="relative">AT</span>
      </span>
      {!compact && (
        <span aria-hidden className="leading-none">
          <span className={cn("block font-display text-[21px] font-extrabold tracking-[-0.02em]", tone === "light" ? "text-cream" : "text-char")}>NAVEED</span>
          <span className={cn("mt-1 block text-[9.5px] font-extrabold uppercase tracking-[.32em]", tone === "light" ? "text-mustard/80" : "text-tamarind-muted")}>
            Fast Food
          </span>
        </span>
      )}
    </span>
  );
}
