"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { getGameInitials, getGameThumbnail } from "@/lib/game-assets";
import { buildCheckoutUrl, buildSupportUrl } from "@/lib/links";
import { type Product } from "@/lib/types";

type ProductPickerModalProps = {
  open: boolean;
  title: string;
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

function getBrands(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function groupProductsByBrand(products: Product[]) {
  const brands = getBrands(products);

  return brands.map((brand) => ({
    brand,
    products: products
      .filter((item) => item.brand === brand)
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0)),
  }));
}

function getLowestPrice(products: Product[]) {
  if (!products.length) return 0;
  return Math.min(...products.map((item) => Number(item.price || 0)));
}

export function ProductPickerModal({
  open,
  title,
  products,
  onClose,
}: ProductPickerModalProps) {
  const [activeBrand, setActiveBrand] = useState("all");

  const thumbnail = getGameThumbnail(title);
  const initials = getGameInitials(title);

  const brandGroups = useMemo(() => groupProductsByBrand(products), [products]);
  const lowestPrice = getLowestPrice(products);

  const visibleGroups =
    activeBrand === "all"
      ? brandGroups
      : brandGroups.filter((group) => group.brand === activeBrand);

  useEffect(() => {
    if (open) {
      setActiveBrand("all");
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sky-950/45 px-3 py-3 backdrop-blur-md md:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-sky-100">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-300 to-rose-400" />

          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/35 to-sky-950/10" />

          <div className="relative flex items-start justify-between gap-4 p-5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
                  Choose brand & duration
                </p>

                <h2 className="mt-1 truncate text-3xl font-black">{title}</h2>

                <p className="mt-1 text-xs font-semibold text-white/80">
                  {products.length} options · {brandGroups.length} brands ·
                  start from {formatRupiah(lowestPrice)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-black text-white backdrop-blur hover:bg-white/30"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="border-b border-sky-100 bg-white px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveBrand("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                activeBrand === "all"
                  ? "bg-sky-500 text-white"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              All Brands
            </button>

            {brandGroups.map((group) => (
              <button
                key={group.brand}
                type="button"
                onClick={() => setActiveBrand(group.brand)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                  activeBrand === group.brand
                    ? "bg-sky-500 text-white"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                }`}
              >
                {group.brand}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto bg-sky-50/70 p-4">
          <div className="grid gap-4">
            {visibleGroups.map((group) => (
              <section
                key={group.brand}
                className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-sky-100"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-sky-500">
                      Brand
                    </p>
                    <h3 className="text-xl font-black text-sky-950">
                      {group.brand}
                    </h3>
                  </div>

                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
                    {group.products.length} options
                  </span>
                </div>

                <div className="grid gap-2">
                  {group.products.map((product) => {
                    const stock = getProductStock(product);
                    const stockUnknown = stock === null;
                    const isOutOfStock = !stockUnknown && stock <= 0;
                    const isLowest =
                      Number(product.price || 0) ===
                      getLowestPrice(group.products);

                    return (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-sky-100 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50/60"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-black text-sky-950">
                                {product.duration}
                              </p>

                              {isLowest ? (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                                  Best price
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 text-xl font-black text-sky-700">
                              {formatRupiah(product.price)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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

                            {isOutOfStock ? (
                              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">
                                Sold Out
                              </span>
                            ) : (
                              <a
                                href={buildCheckoutUrl(product.game)}
                                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
                              >
                                Buy
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-sky-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold leading-5 text-slate-500">
              Setelah klik Buy, kamu akan diarahkan ke checkout website lama
              yang sudah stabil.
            </p>

            <a
              href={buildSupportUrl()}
              className="shrink-0 rounded-full bg-sky-100 px-4 py-2 text-center text-xs font-black text-sky-700 hover:bg-sky-200"
            >
              Ask Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
