import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-rose-400 text-sm font-black text-white">
              AE
            </div>

            <div>
              <p className="text-sm font-black text-sky-950">
                {siteConfig.name}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {siteConfig.tagline}
              </p>
            </div>
          </div>

          <p className="mt-3 max-w-md text-xs font-medium leading-5 text-slate-500">
            Next.js frontend ini masih tahap migrasi. Checkout, login, payment,
            result, dan admin masih memakai backend Express lama agar tetap
            aman.
          </p>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-500">
          <a href="#catalog" className="hover:text-sky-600">
            Catalog
          </a>
          <a href="#benefits" className="hover:text-sky-600">
            Benefits
          </a>
          <a href={siteConfig.links.result} className="hover:text-sky-600">
            Check Order
          </a>
          <a href={siteConfig.links.login} className="hover:text-sky-600">
            Login
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={siteConfig.links.support}
            className="rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white hover:bg-rose-600"
          >
            Telegram Support
          </a>

          <a
            href={siteConfig.links.home}
            className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-700 hover:bg-sky-200"
          >
            Old Website
          </a>
        </div>
      </div>
    </footer>
  );
}
