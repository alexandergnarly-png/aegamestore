export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-rose-400 text-sm font-black text-white">
              AE
            </div>

            <div>
              <p className="text-sm font-black text-sky-950">AE Game Store</p>
              <p className="text-xs font-semibold text-slate-500">
                Premium tools & game keys.
              </p>
            </div>
          </div>

          <p className="mt-3 max-w-md text-xs font-medium leading-5 text-slate-500">
            Next.js frontend ini masih tahap migrasi. Checkout, login, payment,
            result, dan admin masih memakai backend Express lama agar tetap
            aman.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="https://aegamestore.com/result"
            className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-700 hover:bg-sky-200"
          >
            Check Order
          </a>

          <a
            href="https://aegamestore.com/auth"
            className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-700 hover:bg-sky-200"
          >
            Login
          </a>

          <a
            href="https://t.me/aegamestore"
            className="rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white hover:bg-rose-600"
          >
            Telegram Support
          </a>
        </div>
      </div>
    </footer>
  );
}
