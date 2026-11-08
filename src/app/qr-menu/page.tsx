import type { Metadata } from "next";
import { Suspense } from "react";
import { QrMenu } from "@/components/qr/qr-menu";

export const metadata: Metadata = {
  title: "Table menu",
  description: "Scan, browse and order from your table at AT Naveed Fast Food, Pabbi.",
  alternates: { canonical: "/qr-menu" },
};

export default function QrMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <QrMenu />
    </Suspense>
  );
}
