import type { ReactNode } from "react";

/** Smooth page transition on every client-side navigation. */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
