import { CatalogSection } from "@/components/CatalogSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { TrustStrip } from "@/components/TrustStrip";
import { apiFetch } from "@/lib/api";
import { type Product } from "@/lib/types";

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

      <TrustStrip />

      <CatalogSection products={products} />

      <CTASection />

      <Footer />
    </main>
  );
}
