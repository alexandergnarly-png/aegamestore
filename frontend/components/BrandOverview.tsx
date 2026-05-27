import { SectionHeader } from "@/components/SectionHeader";
import { type Product } from "@/lib/types";

function getBrandStats(products: Product[]) {
  const brands = Array.from(new Set(products.map((item) => item.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return brands.map((brand) => {
    const brandProducts = products.filter((item) => item.brand === brand);
    const games = Array.from(new Set(brandProducts.map((item) => item.game)));

    return {
      brand,
      productCount: brandProducts.length,
      gameCount: games.length,
    };
  });
}

export function BrandOverview({ products }: { products: Product[] }) {
  const brands = getBrandStats(products).slice(0, 8);

  if (!brands.length) return null;

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Brands"
          title="Available brands"
          description="Brand list is generated from live product data."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((item) => (
            <a
              key={item.brand}
              href="#catalog"
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-black uppercase tracking-wide text-sky-500">
                Brand
              </p>

              <h3 className="mt-1 truncate text-lg font-black text-sky-950">
                {item.brand}
              </h3>

              <p className="mt-2 text-xs font-semibold text-slate-500">
                {item.productCount} products · {item.gameCount} games
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
