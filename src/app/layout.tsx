import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/manrope";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { getServerCatalog } from "@/lib/data/server-catalog";
import { toInternational } from "@/lib/format";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AT Naveed Fast Food | Burgers, Pizza & Shawarma in Pabbi",
    template: "%s | AT Naveed Fast Food, Pabbi",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: "AT Naveed Fast Food | Order online in Pabbi",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: { card: "summary_large_image", title: "AT Naveed Fast Food", description: siteConfig.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FFC21A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const catalog = await getServerCatalog();
  const s = catalog.settings;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: s.name,
    url: siteConfig.url,
    image: `${siteConfig.url}/opengraph-image`,
    servesCuisine: ["Fast food", "Burgers", "Pizza", "Shawarma", "Fried chicken"],
    priceRange: "Rs. 100 – Rs. 3,000",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash",
    hasMenu: `${siteConfig.url}/menu`,
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.addressLine,
      addressLocality: siteConfig.locality,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.country,
    },
    ...(s.phone ? { telephone: `+${toInternational(s.phone)}` } : {}),
    areaServed: { "@type": "City", name: "Pabbi" },
  };
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers catalog={catalog}>{children}</Providers>
      </body>
    </html>
  );
}
