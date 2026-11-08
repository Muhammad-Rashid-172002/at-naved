"use client";

import { cn } from "@/lib/cn";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        size === "md" ? "h-7 w-12" : "h-6 w-10",
        checked ? "bg-mint" : "bg-tamarind/20",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow transition-transform",
          size === "md" ? "h-5 w-5" : "h-4 w-4",
          checked ? (size === "md" ? "translate-x-6" : "translate-x-5") : "translate-x-1",
        )}
      />
    </button>
  );
}
