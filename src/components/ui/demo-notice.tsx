import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/** Small honesty label on content the restaurant has not confirmed yet. Hidden when NEXT_PUBLIC_SHOW_DEMO_NOTICE=false. */
export function DemoNotice({ children, className }: { children: string; className?: string }) {
  if (!siteConfig.showDemoNotice) return null;
  return <p className={cn("text-xs font-medium text-tamarind-muted", className)}>{children}</p>;
}
