import { formatRupiah } from "@/lib/format";
import { getLowestPrice, getUniqueGames } from "@/lib/products";
import { type Product } from "@/lib/types";

export function StatsBar({ products }: { products: Product[] }) {
  const games = getUniqueGames(products);
  const lowestPrice = getLowestPrice(products);
  const autoCount = products.filter(
    (item) => String(item.delivery_type || "auto").toLowerCase() !== "manual",
  ).length;

  const items = [
    {
      label: "Products",
      value: products.length,
      desc: "Live from API",
    },
    {
      label: "Games",
      value: games.length,
      desc: "Available now",
    },
    {
      label: "Start From",
      value: lowestPrice ? formatRupiah(lowestPrice) : "-",
      desc: "Lowest price",
    },
    {
      label: "Auto Delivery",
      value: autoCount,
      desc: "Auto products",
    },
  ];

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.label}
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100"
          >
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-black text-sky-950">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {item.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
