import { CatalogSection } from "@/components/CatalogSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { GameHighlights } from "@/components/GameHighlights";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { TrustStrip } from "@/components/TrustStrip";
import { apiFetch } from "@/lib/api";
import { getUniqueGames } from "@/lib/products";
import { type Product } from "@/lib/types";

async function getProducts() {
  try {
    return await apiFetch<Product[]>("/public-products");
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const games = getUniqueGames(products);

  return (
    <main className="min-h-screen bg-sky-50 text-sky-950">
      <Navbar />

      <Hero totalProducts={products.length} totalGames={games.length} />

      <GameHighlights products={products} />

      <TrustStrip />

      <HowItWorks />

      <CatalogSection products={products} />

      <CTASection />

      <Footer />
    </main>
  );
}
