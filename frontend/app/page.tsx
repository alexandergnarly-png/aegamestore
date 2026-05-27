import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  game: string;
  brand: string;
  duration: string;
  price: number;
  active: number;
  delivery_type?: string;
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

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-6 text-sky-950">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-500">
            AE Game Store
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Next.js Frontend Test
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data produk ini diambil dari backend Express lama.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100"
            >
              <div className="text-xs font-bold uppercase text-sky-500">
                {item.brand}
              </div>

              <h2 className="mt-1 text-lg font-black">{item.game}</h2>

              <p className="mt-1 text-sm text-slate-500">{item.duration}</p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="font-black text-sky-700">
                  {formatRupiah(item.price)}
                </span>

                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                  {item.delivery_type || "auto"}
                </span>
              </div>
            </article>
          ))}
        </div>

        {!products.length && (
          <div className="mt-5 rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-sky-100">
            Produk belum muncul. Pastikan API backend bisa diakses dari{" "}
            <b>https://aegamestore.com/public-products</b>
          </div>
        )}
      </section>
    </main>
  );
}
