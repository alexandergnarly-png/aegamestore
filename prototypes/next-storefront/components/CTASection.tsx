import { siteConfig } from "@/lib/site";

export function CTASection() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-rose-400 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] opacity-90">
              Need Help?
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-4xl">
              Contact support before buying.
            </h2>

            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/85">
              Kalau masih ragu soal brand, durasi, game support, atau stok,
              langsung hubungi Telegram support dulu biar order lebih aman.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={siteConfig.links.support}
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-sky-700 shadow-sm hover:bg-sky-50"
            >
              Telegram Support
            </a>

            <a
              href={siteConfig.links.result}
              className="rounded-full bg-white/20 px-5 py-3 text-sm font-black text-white ring-1 ring-white/30 hover:bg-white/25"
            >
              Check Order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
