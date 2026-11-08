import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getServerCatalog } from "@/lib/data/server-catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getServerCatalog();
  const now = new Date();
  const u = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    u("/", 1, "daily"),
    u("/menu", 0.9, "daily"),
    u("/offers", 0.8, "daily"),
    u("/contact", 0.7, "monthly"),
    u("/about", 0.5, "monthly"),
    u("/qr-menu", 0.4),
    ...c.categories.filter((x) => x.enabled).map((x) => u(`/menu/${x.slug}`, 0.8)),
    ...c.products.map((p) => u(`/product/${p.id}`, 0.6)),
  ];
}
