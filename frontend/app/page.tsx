import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  game: string;
  brand: string;
  duration: string;
  price: number;
  active: number;
  delivery_type?: string;
  stock?: number;
};

async function getProducts() {
  try {
    return await apiFetch<Product[]>("/public-products");
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return [];
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getUniqueGames(products: Product[]) {
  return Array.from(new Set(products.map((item) => item.game))).filter(Boolean);
}

export default async function HomePage() {
  const products = await getProducts();
  const games = getUniqueGames(products);

  return (
    <main className="min-h-screen bg-sky-50 text-sky-950">
      <nav className="sticky top-0 z-20 border-b border-sky-100 bg-white/85 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-rose-400 text-lg font-black text-white shadow-sm">
              AE
            </div>

            <div>
              <p className="text-sm font-black leading-tight">AE Game Store</p>
              <p className="text-xs font-semibold text-slate-500">
                Premium tools & game keys
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#catalog"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-100 hover:text-sky-700"
            >
              Catalog
            </a>
            <a
              href="https://aegamestore.com/auth"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-100 hover:text-sky-700"
            >
              Login
            </a>
            <a
              href="https://t.me/aegamestore"
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
            >
              Support
            </a>
          </div>

          <a
            href="#catalog"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-black text-white shadow-sm md:hidden"
          >
            Catalog
          </a>
        </div>
      </nav>

      <section className="px-4 py-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-stretch">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-sky-100 md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">
              Premium Top Up Store
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-sky-950 md:text-6xl">
              Fast game keys, clean checkout, trusted support.
            </h1>

            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500 md:text-base">
              Pilih game, pilih durasi, bayar via QRIS, lalu cek result page.
              Next.js frontend ini masih tahap awal dan tetap pakai backend
              Express lama.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-sky-600"
              >
                Browse Catalog
              </a>
              <a
                href="https://aegamestore.com/result"
                className="rounded-full bg-sky-100 px-5 py-3 text-sm font-black text-sky-700 hover:bg-sky-200"
              >
                Check Order
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-rose-300 p-6 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-90">
              Live Catalog
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl bg-white/20 p-4 backdrop-blur">
                <p className="text-sm font-bold opacity-90">Total Products</p>
                <p className="mt-1 text-4xl font-black">{products.length}</p>
              </div>

              <div className="rounded-3xl bg-white/20 p-4 backdrop-blur">
                <p className="text-sm font-bold opacity-90">Game Available</p>
                <p className="mt-1 text-4xl font-black">{games.length}</p>
              </div>

              <div className="rounded-3xl bg-white/20 p-4 backdrop-blur">
                <p className="text-sm font-bold opacity-90">Delivery</p>
                <p className="mt-1 text-2xl font-black">Auto / Manual</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">
                Catalog
              </p>
              <h2 className="mt-1 text-2xl font-black text-sky-950">
                Available Products
              </h2>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Data langsung dari backend production.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <article
                key={item.id}
                className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-wide text-sky-500">
                      {item.brand}
                    </div>

                    <h3 className="mt-1 truncate text-lg font-black text-sky-950">
                      {item.game}
                    </h3>
                  </div>

                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
                    {item.delivery_type || "auto"}
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  {item.duration}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Start from
                    </p>
                    <p className="text-lg font-black text-sky-700">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <a
                    href={`https://aegamestore.com/?game=${encodeURIComponent(
                      item.game,
                    )}`}
                    className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
                  >
                    Buy
                  </a>
                </div>
              </article>
            ))}
          </div>

          {!products.length && (
            <div className="rounded-3xl bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-sky-100">
              Produk belum muncul. Pastikan API backend bisa diakses dari{" "}
              <b>https://aegamestore.com/public-products</b>.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
