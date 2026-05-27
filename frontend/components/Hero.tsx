type HeroProps = {
  totalProducts: number;
  totalGames: number;
};

export function Hero({ totalProducts, totalGames }: HeroProps) {
  return (
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
              <p className="mt-1 text-4xl font-black">{totalProducts}</p>
            </div>

            <div className="rounded-3xl bg-white/20 p-4 backdrop-blur">
              <p className="text-sm font-bold opacity-90">Game Available</p>
              <p className="mt-1 text-4xl font-black">{totalGames}</p>
            </div>

            <div className="rounded-3xl bg-white/20 p-4 backdrop-blur">
              <p className="text-sm font-bold opacity-90">Delivery</p>
              <p className="mt-1 text-2xl font-black">Auto / Manual</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
