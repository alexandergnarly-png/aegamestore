"use client";

import { formatRupiah } from "@/lib/format";
import { getGameInitials, getGameThumbnail } from "@/lib/game-assets";
import { type Product } from "@/lib/types";

type ProductGroupCardProps = {
  game: string;
  brand: string;
  products: Product[];
  onOpen: () => void;
};

function getLowestPrice(products: Product[]) {
  if (!products.length) return 0;

  return Math.min(...products.map((item) => Number(item.price || 0)));
}

export function ProductGroupCard({
  game,
  brand,
  products,
  onOpen,
}: ProductGroupCardProps) {
  const thumbnail = getGameThumbnail(game);
  const initials = getGameInitials(game);
  const lowestPrice = getLowestPrice(products);

  return (
    <article className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-rose-100 ring-1 ring-sky-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={game}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black text-sky-700">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-sky-500">
              {brand}
            </p>
            <h3 className="mt-1 truncate text-xl font-black text-sky-950">
              {game}
            </h3>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {products.length} options available
            </p>
          </div>
        </div>

        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
          Options
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {products.slice(0, 3).map((item) => (
          <span
            key={item.id}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
          >
            {item.duration}
          </span>
        ))}

        {products.length > 3 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            +{products.length - 3} more
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Start from</p>
          <p className="text-lg font-black text-sky-700">
            {formatRupiah(lowestPrice)}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
        >
          View Options
        </button>
      </div>
    </article>
  );
}
