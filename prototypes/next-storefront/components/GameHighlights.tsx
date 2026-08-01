import { SectionHeader } from "@/components/SectionHeader";
import { formatRupiah } from "@/lib/format";
import { getGameInitials, getGameThumbnail } from "@/lib/game-assets";
import { getGameStats } from "@/lib/products";
import { type Product } from "@/lib/types";

export function GameHighlights({ products }: { products: Product[] }) {
  const gameStats = getGameStats(products).slice(0, 6);

  if (!gameStats.length) return null;

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Game Highlights"
          title="Popular games in catalog"
          description="Browse the most visible game groups from your live product catalog."
          action={
            <a
              href="#catalog"
              className="text-sm font-black text-sky-600 hover:text-sky-700"
            >
              View all products →
            </a>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gameStats.map((item) => {
            const thumbnail = getGameThumbnail(item.game);
            const initials = getGameInitials(item.game);

            return (
              <a
                key={item.game}
                href="#catalog"
                className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-rose-100 ring-1 ring-sky-100">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={item.game}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-black text-sky-700">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-sky-950">
                      {item.game}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.productCount} products · {item.brands.length} brands
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Lowest price
                    </p>
                    <p className="text-base font-black text-sky-700">
                      {formatRupiah(item.lowestPrice)}
                    </p>
                  </div>

                  <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-700 group-hover:bg-sky-500 group-hover:text-white">
                    Browse
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
