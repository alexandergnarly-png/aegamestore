import { type Product } from "@/lib/types";

export function getUniqueGames(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.game)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getLowestPrice(products: Product[]) {
  if (!products.length) return 0;

  return Math.min(...products.map((item) => Number(item.price || 0)));
}

export function getGameStats(products: Product[]) {
  const games = getUniqueGames(products);

  return games.map((game) => {
    const gameProducts = products.filter((item) => item.game === game);

    return {
      game,
      productCount: gameProducts.length,
      lowestPrice: getLowestPrice(gameProducts),
      brands: Array.from(new Set(gameProducts.map((item) => item.brand)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    };
  });
}
