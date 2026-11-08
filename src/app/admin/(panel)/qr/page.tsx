import type { Metadata } from "next";
import { QrGenerator } from "@/components/admin/qr-generator";

export const metadata: Metadata = { title: "QR codes" };

export default function AdminQrPage() {
  return <QrGenerator />;
}
