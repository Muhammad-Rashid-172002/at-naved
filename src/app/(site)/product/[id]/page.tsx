import type { Metadata } from "next";
import { ProductDetail } from "@/components/menu/product-detail";
import { getServerCatalog } from "@/lib/data/server-catalog";
import { formatPrice } from "@/lib/format";
import { effectivePrice } from "@/lib/pricing";
import { siteConfig } from "@/config/site";
import { imageFor, resolveImage } from "@/config/images";

export async function generateStaticParams() {
  const c = await getServerCatalog();
  return c.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getServerCatalog();
  const p = c.products.find((x) => x.id === params.id);
  if (!p) return { title: "Menu item", robots: { index: false } };
  const img = resolveImage(imageFor(p));
  const ogImage = img.remote ? `${img.src}?auto=format&fit=crop&w=1200&h=630&q=75` : img.src;
  return {
    title: `${p.name}, ${formatPrice(effectivePrice(p))}`,
    description: `${p.description} Order ${p.name} online from AT Naveed Fast Food, Pabbi.`,
    alternates: { canonical: `/product/${p.id}` },
    openGraph: { title: p.name, description: p.description, images: ogImage.startsWith("data:") ? undefined : [ogImage] },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const c = await getServerCatalog();
  const p = c.products.find((x) => x.id === params.id);
  const jsonLd = p && {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: p.name,
    description: p.description,
    offers: { "@type": "Offer", price: effectivePrice(p), priceCurrency: "PKR", availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    url: `${siteConfig.url}/product/${p.id}`,
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ProductDetail id={params.id} />
    </>
  );
}
