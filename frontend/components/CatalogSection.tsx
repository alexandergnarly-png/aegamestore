"use client";

import { useMemo, useState } from "react";
import { ProductCard, type Product } from "@/components/ProductCard";

type SortMode = "recommended" | "price-low" | "price-high" | "name";

function getUniqueGames(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.game))).filter(Boolean);
}

export function CatalogSection({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");

  const games = useMemo(() => getUniqueGames(products), [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = products.filter((item) => {
      const matchSearch =
        !keyword ||
        item.game.toLowerCase().includes(keyword) ||
        item.brand.toLowerCase().includes(keyword) ||
        item.duration.toLowerCase().includes(keyword);

      const matchGame = gameFilter === "all" || item.game === gameFilter;

      return matchSearch && matchGame;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "price-low") return a.price - b.price;
      if (sortMode === "price-high") return b.price - a.price;
      if (sortMode === "name") {
        return `${a.game} ${a.brand}`.localeCompare(`${b.game} ${b.brand}`);
      }

      return 0;
    });
  }, [products, search, gameFilter, sortMode]);

  return (
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
            {filteredProducts.length} dari {products.length} produk tampil.
          </p>
        </div>

        <div className="mb-5 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-sky-100">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search game, brand, duration..."
              className="h-12 rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-semibold text-sky-950 outline-none transition focus:border-sky-300 focus:bg-white"
            />

            <select
              value={gameFilter}
              onChange={(event) => setGameFilter(event.target.value)}
              className="h-12 rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-sky-950 outline-none transition focus:border-sky-300 focus:bg-white"
            >
              <option value="all">All Games</option>
              {games.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>

            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-12 rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-sky-950 outline-none transition focus:border-sky-300 focus:bg-white"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Lowest price</option>
              <option value="price-high">Highest price</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-sky-100">
            Produk tidak ditemukan. Coba ganti keyword atau filter game.
          </div>
        )}
      </div>
    </section>
  );
}
