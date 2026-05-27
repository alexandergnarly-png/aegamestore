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

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wide text-sky-500">
            {product.brand}
          </div>

          <h3 className="mt-1 truncate text-lg font-black text-sky-950">
            {product.game}
          </h3>
        </div>

        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
          {product.delivery_type || "auto"}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-500">
        {product.duration}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Start from</p>
          <p className="text-lg font-black text-sky-700">
            {formatRupiah(product.price)}
          </p>
        </div>

        <a
          href={`https://aegamestore.com/?game=${encodeURIComponent(
            product.game,
          )}`}
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
        >
          Buy
        </a>
      </div>
    </article>
  );
}
