"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cn(
    "grid place-items-center rounded-full text-tamarind transition hover:bg-mustard-soft active:scale-90 disabled:opacity-30",
    size === "md" ? "h-10 w-10" : "h-8 w-8",
  );
  return (
    <div className="inline-flex items-center rounded-full border-2 border-line bg-white p-0.5" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("text-center font-bold tabular-nums", size === "md" ? "w-8 text-base" : "w-6 text-sm")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
