const trustItems = [
  {
    icon: "⚡",
    title: "Fast Delivery",
    desc: "Auto delivery untuk produk yang tersedia.",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    desc: "Checkout tetap lewat backend Express + payment lama.",
  },
  {
    icon: "🎟️",
    title: "Voucher Ready",
    desc: "Support voucher dan diskon dari admin panel.",
  },
  {
    icon: "👑",
    title: "VIP Benefit",
    desc: "Diskon VIP bisa aktif otomatis untuk buyer tertentu.",
  },
];

export function TrustStrip() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-100"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-xl">
                {item.icon}
              </div>

              <h3 className="mt-3 text-sm font-black text-sky-950">
                {item.title}
              </h3>

              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
