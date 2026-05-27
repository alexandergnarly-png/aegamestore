"use client";

import { formatRupiah } from "@/lib/format";
import { getGameInitials, getGameThumbnail } from "@/lib/game-assets";
import { buildCheckoutUrl } from "@/lib/links";
import { type Product } from "@/lib/types";

type ProductPickerModalProps = {
  open: boolean;
  title: string;
  brand: string;
  products: Product[];
  onClose: () => void;
};

function getProductStock(product: Product) {
  const rawStock =
    product.stock ?? product.stock_count ?? product.available_stock ?? null;

  if (rawStock === null || rawStock === undefined) {
    return null;
  }

  return Number(rawStock || 0);
}

export function ProductPickerModal({
  open,
  title,
  brand,
  products,
  onClose,
}: ProductPickerModalProps) {
  if (!open) return null;

  const thumbnail = getGameThumbnail(title);
  const initials = getGameInitials(title);

  const sortedProducts = [...products].sort(
    (a, b) => Number(a.price || 0) - Number(b.price || 0),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sky-950/35 px-3 py-3 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-sky-100">
        <div className="flex items-start justify-between gap-4 border-b border-sky-100 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-rose-100 ring-1 ring-sky-100">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
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
              <h2 className="truncate text-2xl font-black text-sky-950">
                {title}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Choose duration / product option
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xl font-black text-sky-700 hover:bg-sky-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-4">
          <div className="grid gap-3">
            {sortedProducts.map((product) => {
              const stock = getProductStock(product);
              const stockUnknown = stock === null;
              const isOutOfStock = !stockUnknown && stock <= 0;

              return (
                <div
                  key={product.id}
                  className="rounded-3xl border border-sky-100 bg-sky-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-sky-950">
                        {product.duration}
                      </p>
                      <p className="mt-1 text-sm font-black text-sky-700">
                        {formatRupiah(product.price)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        isOutOfStock
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {stockUnknown
                        ? "Available"
                        : isOutOfStock
                          ? "Stock empty"
                          : `${stock} stock`}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Payment & delivery handled by old stable checkout.
                    </p>

                    {isOutOfStock ? (
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">
                        Sold Out
                      </span>
                    ) : (
                      <a
                        href={buildCheckoutUrl(product.game)}
                        className="shrink-0 rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
                      >
                        Buy
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-sky-100 bg-white p-4">
          <p className="text-center text-xs font-semibold text-slate-500">
            Setelah klik Buy, kamu akan diarahkan ke checkout website lama yang
            sudah stabil.
          </p>
        </div>
      </div>
    </div>
  );
}
