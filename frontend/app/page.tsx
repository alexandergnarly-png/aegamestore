import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type Product } from "@/components/ProductCard";
import { apiFetch } from "@/lib/api";

async function getProducts() {
  try {
    return await apiFetch<Product[]>("/public-products");
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return [];
  }
}

function getUniqueGames(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.game))).filter(Boolean);
}

export default async function HomePage() {
  const products = await getProducts();
  const games = getUniqueGames(products);

  return (
    <main className="min-h-screen bg-sky-50 text-sky-950">
      <Navbar />

      <Hero totalProducts={products.length} totalGames={games.length} />

      <section id="catalog" className="px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">
                Catalog
              </p>
              <h2 className="mt-1 text-2xl font-black text-sky-950">
                Available Products
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Data langsung dari backend production.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>

          {!products.length && (
            <div className="rounded-3xl bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-sky-100">
              Produk belum muncul. Pastikan API backend bisa diakses dari{" "}
              <b>https://aegamestore.com/public-products</b>.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
