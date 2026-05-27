import { BrandOverview } from "@/components/BrandOverview";
import { CatalogSection } from "@/components/CatalogSection";
import { CTASection } from "@/components/CTASection";
import { FAQSection } from "@/components/FAQSection";
import { FeaturedDeals } from "@/components/FeaturedDeals";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { GameHighlights } from "@/components/GameHighlights";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { StatsBar } from "@/components/StatsBar";
import { StoreNotice } from "@/components/StoreNotice";
import { SupportCards } from "@/components/SupportCards";
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

      <StoreNotice />

      <StatsBar products={products} />

      <GameHighlights products={products} />

      <BrandOverview products={products} />

      <FeaturedDeals products={products} />

      <TrustStrip />

      <HowItWorks />

      <CatalogSection products={products} />

      <SupportCards />

      <CTASection />

      <FAQSection />

      <Footer />

      <FloatingActions />
    </main>
  );
}
