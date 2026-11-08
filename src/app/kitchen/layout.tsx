import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Kitchen", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[#21100C] text-white">{children}</div>;
}
