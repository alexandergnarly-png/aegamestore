export function StoreNotice() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-sky-950">
              Frontend migration mode
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              Halaman ini adalah versi Next.js baru. Checkout, payment, login,
              result, dan admin masih diarahkan ke sistem lama supaya tetap
              aman.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
              Express backend connected
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
              Production API
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
