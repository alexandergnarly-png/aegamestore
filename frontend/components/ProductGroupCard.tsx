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
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="grid grid-cols-[82px_1fr] gap-3 p-3 sm:block sm:p-0">
          <div className="relative h-[92px] overflow-hidden rounded-2xl bg-gradient-to-br from-sky-200 via-cyan-100 to-rose-100 sm:h-36 sm:rounded-none">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={game}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-black text-sky-700 sm:text-4xl">
                {initials}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/55 via-sky-950/5 to-transparent" />

            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-sky-700 backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
              {brands.length} brands
            </div>
          </div>

          <div className="min-w-0 sm:p-4">
            <div className="sm:hidden">
              <h3 className="truncate text-lg font-black text-sky-950">
                {game}
              </h3>
              <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                {products.length} options available
              </p>
            </div>

            <div className="hidden sm:block">
              <h3 className="truncate text-2xl font-black text-sky-950">
                {game}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {products.length} options available
              </p>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              {brands.slice(0, 2).map((brand) => (
                <span
                  key={brand}
                  className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700 sm:px-3 sm:text-xs"
                >
                  {brand}
                </span>
              ))}

              {brands.length > 2 ? (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700 sm:px-3 sm:text-xs">
                  +{brands.length - 2}
                </span>
              ) : null}
            </div>

            <div className="mt-2 hidden flex-wrap gap-2 sm:flex">
              {durations.slice(0, 4).map((duration) => (
                <span
                  key={duration}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                >
                  {duration}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 sm:mt-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 sm:text-xs">
                  Start from
                </p>
                <p className="text-base font-black text-sky-700 sm:text-xl">
                  {formatRupiah(lowestPrice)}
                </p>
              </div>

              <span className="rounded-full bg-rose-500 px-3 py-2 text-xs font-black text-white shadow-sm shadow-rose-500/25 transition group-hover:bg-rose-600 sm:px-4 sm:text-sm">
                Options
              </span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}
