import type { Metadata } from "next";
import { Analytics } from "@/components/admin/analytics";

export const metadata: Metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return <Analytics />;
}
