import { siteConfig } from "@/lib/site";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-sky-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-rose-400 text-lg font-black text-white shadow-sm shadow-sky-200">
            AE
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight text-sky-950">
              {siteConfig.name}
            </p>
            <p className="truncate text-xs font-semibold text-slate-500">
              {siteConfig.tagline}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#catalog"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-sky-100 hover:text-sky-700"
          >
            Catalog
          </a>

          <a
            href="#how-it-works"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-sky-100 hover:text-sky-700"
          >
            How It Works
          </a>

          <a
            href={siteConfig.links.login}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-sky-100 hover:text-sky-700"
          >
            Login
          </a>

          <a
            href={siteConfig.links.support}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm shadow-rose-500/20 transition hover:bg-rose-600"
          >
            Support
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href="#catalog"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-black text-white shadow-sm"
          >
            Catalog
          </a>

          <a
            href={siteConfig.links.support}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm"
            aria-label="Support"
          >
            💬
          </a>
        </div>
      </div>
    </nav>
  );
}
