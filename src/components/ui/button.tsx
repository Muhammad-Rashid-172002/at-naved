import { Loader2 } from "lucide-react";
import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "mustard" | "outline" | "ghost" | "dark" | "danger" | "success" | "light" | "flame" | "glass";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-ketchup text-white shadow-cta hover:bg-ketchup-dark",
  mustard: "bg-mustard text-tamarind hover:bg-mustard-dark",
  outline: "border-2 border-tamarind/15 bg-white text-tamarind hover:border-tamarind/40",
  ghost: "text-tamarind hover:bg-tamarind/5",
  dark: "bg-tamarind text-white hover:bg-tamarind-soft",
  danger: "bg-white text-ketchup ring-1 ring-ketchup/30 hover:bg-ketchup-light",
  success: "bg-mint text-white hover:brightness-110",
  light: "bg-white text-tamarind hover:bg-paper-warm",
  flame: "bg-gradient-to-b from-[#FF6A2A] to-flame-dark text-white shadow-glow hover:brightness-110 hover:-translate-y-0.5",
  glass: "border border-white/20 bg-white/5 text-cream backdrop-blur hover:border-white/40 hover:bg-white/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
  icon: "h-10 w-10",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({ href, variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  const cls = buttonClass(variant, size, className);
  if (/^(https?:|tel:|mailto:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
