import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { type Product } from "@/lib/types";

function getFeaturedProducts(products: Product[]) {
  return [...products]
    .filter((item) => Number(item.active) === 1)
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    .slice(0, 6);
}

export function FeaturedDeals({ products }: { products: Product[] }) {
  const featuredProducts = getFeaturedProducts(products);

  if (!featuredProducts.length) return null;

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Featured"
          title="Best starting prices"
          description="Produk dengan harga awal paling rendah dari live catalog."
          action={
            <a
              href="#catalog"
              className="text-sm font-black text-sky-600 hover:text-sky-700"
            >
              Browse all →
            </a>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
