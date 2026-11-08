"use client";

import { ChevronLeft, Clock, SearchX } from "lucide-react";
import Link from "next/link";
import { useCatalog } from "@/components/providers/catalog-provider";
import { FoodImage } from "@/components/ui/food-image";
import { EmptyState, Rating } from "@/components/ui/misc";
import { discountPercent } from "@/lib/pricing";
import { Price } from "./price";
import { ProductCard } from "./product-card";
import { ProductOptions } from "./product-options";

export function ProductDetail({ id }: { id: string }) {
  const { getProduct, getCategory, productsIn, ready } = useCatalog();
  const product = getProduct(id);
  const category = product ? getCategory(product.categoryId) : undefined;

  if (!product || !category?.enabled) {
    if (!ready) return <div className="container-x h-[60vh]" aria-busy="true" />;
    return (
      <div className="container-x">
        <EmptyState
          icon={SearchX}
          title="This item is not on the menu"
          body="It may have been removed or renamed. Have a look at what’s available today."
          action={<Link href="/menu" className="font-bold text-ketchup underline underline-offset-4">Browse the menu</Link>}
        />
      </div>
    );
  }

  const related = productsIn(product.categoryId).filter((p) => p.id !== product.id).slice(0, 4);
  const off = discountPercent(product);

  return (
    <div className="pb-28 md:pb-0">
      <div className="container-x pt-6">
        <Link href={`/menu/${category.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-tamarind-muted hover:text-tamarind">
          <ChevronLeft className="h-4 w-4" /> {category.name}
        </Link>
      </div>
      <div className="container-x grid gap-8 py-6 md:grid-cols-2 md:gap-12 lg:py-10">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-mustard-soft ring-1 ring-line">
            <FoodImage src={product.image} alt={product.name} priority sizes="(max-width: 768px) 100vw, 50vw" />
            {off > 0 && (
              <span className="absolute left-4 top-4 -rotate-3 rounded-xl border-2 border-tamarind bg-ketchup px-3 py-1 font-extrabold text-white shadow-sticker">
                {off}% off
              </span>
            )}
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} />
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-tamarind-muted">
              <Clock className="h-4 w-4" /> About {product.preparationTime} min
            </span>
          </div>
          <p className="mt-5 text-lg text-tamarind-soft">{product.description}</p>
          <Price product={product} className="mt-5 [&>span:first-child]:text-3xl" />
          <div className="mt-8">
            <ProductOptions product={product} stickyOnMobile />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-x pb-16" aria-labelledby="related">
          <h2 id="related" className="font-display text-2xl font-extrabold">
            More {category.name.toLowerCase()}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
