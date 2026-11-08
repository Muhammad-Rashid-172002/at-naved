import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { PageHeader } from "@/components/ui/misc";
import { getServerCatalog } from "@/lib/data/server-catalog";

export async function generateStaticParams() {
  const c = await getServerCatalog();
  return c.categories.filter((x) => x.enabled).map((x) => ({ category: x.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const c = await getServerCatalog();
  const cat = c.categories.find((x) => x.slug === params.category);
  if (!cat) return { title: "Menu", robots: { index: false } };
  return {
    title: `${cat.name} in Pabbi`,
    description: `Order ${cat.name.toLowerCase()} online from AT Naveed Fast Food, Pabbi. ${cat.description}.`,
    alternates: { canonical: `/menu/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const c = await getServerCatalog();
  const cat = c.categories.find((x) => x.slug === params.category);
  return (
    <>
      <PageHeader title={cat?.name ?? "Menu"} intro={cat?.description} />
      <div className="container-x pb-20">
        <MenuBrowser categorySlug={params.category} />
      </div>
    </>
  );
}
