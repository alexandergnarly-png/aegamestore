import { siteConfig } from "@/lib/site";

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
            Premium Game Key Store
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-sky-950 md:text-6xl">
            Fast checkout for premium game keys.
          </h1>

          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500 md:text-base">
            Browse product, pick duration, pay securely, then check your order
            result. This Next.js frontend is connected to the existing Express
            backend.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-sky-600"
            >
              Browse Catalog
            </a>

            <a
              href={siteConfig.links.result}
              className="rounded-full bg-sky-100 px-5 py-3 text-sm font-black text-sky-700 hover:bg-sky-200"
            >
              Check Order
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
              Auto delivery ready
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
              QRIS payment
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
              Telegram support
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-rose-300 p-6 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-90">
            Live Store Stats
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
              <p className="text-sm font-bold opacity-90">Current Backend</p>
              <p className="mt-1 text-2xl font-black">Express API</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
