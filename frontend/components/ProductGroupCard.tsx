"use client";

import { formatRupiah } from "@/lib/format";
import { getGameInitials, getGameThumbnail } from "@/lib/game-assets";
import { type Product } from "@/lib/types";

type ProductGroupCardProps = {
  game: string;
  products: Product[];
  onOpen: () => void;
};

function getLowestPrice(products: Product[]) {
  if (!products.length) return 0;
  return Math.min(...products.map((item) => Number(item.price || 0)));
}

function getUniqueBrands(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function getUniqueDurations(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.duration))).filter(
    Boolean,
  );
}

export function ProductGroupCard({
  game,
  products,
  onOpen,
}: ProductGroupCardProps) {
  const thumbnail = getGameThumbnail(game);
  const initials = getGameInitials(game);
  const lowestPrice = getLowestPrice(products);
  const brands = getUniqueBrands(products);
  const durations = getUniqueDurations(products);

  return (
    <article className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-sky-200 via-cyan-100 to-rose-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={game}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-black text-sky-700">
              {initials}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/65 via-sky-950/10 to-transparent" />

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-sky-700 backdrop-blur">
            {brands.length} brands
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="truncate text-2xl font-black text-white drop-shadow">
              {game}
            </h3>
            <p className="mt-1 text-xs font-bold text-white/85">
              {products.length} options available
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {brands.slice(0, 3).map((brand) => (
              <span
                key={brand}
                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700"
              >
                {brand}
              </span>
            ))}

            {brands.length > 3 ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                +{brands.length - 3}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {durations.slice(0, 4).map((duration) => (
              <span
                key={duration}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
              >
                {duration}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-400">Start from</p>
              <p className="text-xl font-black text-sky-700">
                {formatRupiah(lowestPrice)}
              </p>
            </div>

            <span className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm shadow-rose-500/25 transition group-hover:bg-rose-600">
              View Options
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
