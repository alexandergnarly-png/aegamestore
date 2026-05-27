export type Product = {
  id: number;
  game: string;
  brand: string;
  duration: string;
  price: number;
  active: number;
  delivery_type?: string;
  stock?: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getDeliveryLabel(type?: string) {
  const deliveryType = String(type || "auto").toLowerCase();

  if (deliveryType === "manual") {
    return "Manual";
  }

  return "Auto";
}

export function ProductCard({ product }: { product: Product }) {
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const deliveryLabel = getDeliveryLabel(product.delivery_type);

  return (
    <article
      className={`group rounded-3xl bg-white p-4 shadow-sm ring-1 transition ${
        isOutOfStock
          ? "opacity-70 ring-slate-100"
          : "ring-sky-100 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wide text-sky-500">
            {product.brand}
          </div>

          <h3 className="mt-1 truncate text-lg font-black text-sky-950">
            {product.game}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            deliveryLabel === "Manual"
              ? "bg-amber-100 text-amber-700"
              : "bg-sky-100 text-sky-700"
          }`}
        >
          {deliveryLabel}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-500">
        {product.duration}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isOutOfStock
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isOutOfStock ? "Stock empty" : `${stock} stock ready`}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          Instant result page
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Start from</p>
          <p className="text-lg font-black text-sky-700">
            {formatRupiah(product.price)}
          </p>
        </div>

        {isOutOfStock ? (
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">
            Sold Out
          </span>
        ) : (
          <a
            href={`https://aegamestore.com/?game=${encodeURIComponent(
              product.game,
            )}`}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
          >
            Buy
          </a>
        )}
      </div>
    </article>
  );
}
