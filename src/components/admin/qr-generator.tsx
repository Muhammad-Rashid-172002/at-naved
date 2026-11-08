"use client";

import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import { siteConfig } from "@/config/site";
import { AdminTitle, Panel } from "./admin-shell";

export function QrGenerator() {
  const [origin, setOrigin] = useState(siteConfig.url);
  const [tables, setTables] = useState(6);
  const [general, setGeneral] = useState(true);
  useEffect(() => {
    if (siteConfig.url.includes("localhost")) setOrigin(window.location.origin);
  }, []);
  const codes = [
    ...(general ? [{ label: "Scan to order", url: `${origin}/qr-menu` }] : []),
    ...Array.from({ length: Math.min(50, Math.max(0, tables)) }, (_, i) => ({ label: `Table ${i + 1}`, url: `${origin}/qr-menu?table=${i + 1}` })),
  ];

  return (
    <div>
      <div className="no-print">
        <AdminTitle
          title="QR codes"
          subtitle="Print and stick these on tables. Table codes tag each order with the table number."
          actions={
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          }
        />
        <Panel className="mb-6">
          <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-end">
            <Field label="Number of tables" htmlFor="qr-tables">
              <Input id="qr-tables" type="number" min={0} max={50} value={tables} onChange={(e) => setTables(Number(e.target.value) || 0)} />
            </Field>
            <label className="flex items-center gap-2 pb-3 font-semibold">
              <input type="checkbox" checked={general} onChange={(e) => setGeneral(e.target.checked)} className="h-5 w-5 accent-tamarind" /> Include a general code for the counter or flyers
            </label>
          </div>
          <p className="mt-3 text-sm text-tamarind-muted">Codes point to {origin}. Set NEXT_PUBLIC_SITE_URL to your live domain before printing.</p>
        </Panel>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3">
        {codes.map((c) => (
          <figure key={c.url} className="flex break-inside-avoid flex-col items-center rounded-2xl border-[3px] border-tamarind bg-white p-4 text-center">
            <p className="font-display text-lg font-extrabold">AT NAVEED</p>
            <QRCodeSVG value={c.url} size={160} level="M" marginSize={2} className="h-auto w-full max-w-[160px]" />
            <figcaption className="mt-2 font-display text-xl font-extrabold">{c.label}</figcaption>
            <p className="text-xs text-tamarind-muted">Scan, order, pay at the counter</p>
          </figure>
        ))}
      </div>
    </div>
  );
}
