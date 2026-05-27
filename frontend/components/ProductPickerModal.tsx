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

  if (rawStock === null || rawStock === undefined) return null;

  return Number(rawStock || 0);
}

function getBrands(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.brand)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function groupProductsByBrand(products: Product[]) {
  return getBrands(products).map((brand) => ({
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
    if (!open) return;

    setActiveBrand("all");
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-sky-950/45 px-2 pb-2 pt-8 backdrop-blur-md md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.7rem] bg-white shadow-2xl ring-1 ring-sky-100 md:max-h-[82vh] md:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-cyan-300 to-rose-400" />

          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/35 to-sky-950/5" />

          <div className="relative p-4 text-white md:p-5">
            <div className="mb-3 flex items-center justify-center md:hidden">
              <div className="h-1.5 w-12 rounded-full bg-white/40" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-13 w-13 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur md:h-16 md:w-16 md:rounded-3xl">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black text-white">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 md:text-xs">
                    Choose option
                  </p>

                  <h2 className="mt-0.5 truncate text-2xl font-black md:text-3xl">
                    {title}
                  </h2>

                  <p className="mt-1 text-[11px] font-semibold text-white/80 md:text-xs">
                    {products.length} options · {brandGroups.length} brands ·{" "}
                    {formatRupiah(lowestPrice)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-black text-white backdrop-blur transition hover:bg-white/30"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveBrand("all")}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black transition md:text-xs ${
                  activeBrand === "all"
                    ? "bg-white text-sky-700"
                    : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
                }`}
              >
                All Brands
              </button>

              {brandGroups.map((group) => (
                <button
                  key={group.brand}
                  type="button"
                  onClick={() => setActiveBrand(group.brand)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black transition md:text-xs ${
                    activeBrand === group.brand
                      ? "bg-white text-sky-700"
                      : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
                  }`}
                >
                  {group.brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-sky-50/70 p-3 md:p-4">
          <div className="grid gap-3">
            {visibleGroups.map((group) => (
              <section
                key={group.brand}
                className="rounded-[1.35rem] bg-white p-3 shadow-sm ring-1 ring-sky-100 md:p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-sky-500 md:text-xs">
                      Brand
                    </p>
                    <h3 className="text-base font-black text-sky-950 md:text-lg">
                      {group.brand}
                    </h3>
                  </div>

                  <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-black text-sky-700 md:text-xs">
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
                        className="rounded-2xl border border-sky-100 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-sm font-black text-sky-950 md:text-base">
                                {product.duration}
                              </p>

                              {isLowest ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                  Best price
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 text-base font-black text-sky-700 md:text-lg">
                              {formatRupiah(product.price)}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`hidden rounded-full px-2.5 py-1 text-[10px] font-black sm:inline-flex ${
                                isOutOfStock
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {stockUnknown
                                ? "Available"
                                : isOutOfStock
                                  ? "Empty"
                                  : `${stock} stock`}
                            </span>

                            {isOutOfStock ? (
                              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-400">
                                Sold Out
                              </span>
                            ) : (
                              <a
                                href={buildCheckoutUrl(product.game)}
                                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-rose-500/20 transition hover:bg-rose-600 md:text-sm"
                              >
                                Buy
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
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

                          <p className="text-[10px] font-semibold text-slate-400">
                            Stable checkout
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-sky-100 bg-white p-3 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold leading-5 text-slate-500 md:text-xs">
              Checkout tetap diarahkan ke website lama yang sudah stabil.
            </p>

            <a
              href={buildSupportUrl()}
              className="shrink-0 rounded-full bg-sky-100 px-3.5 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
