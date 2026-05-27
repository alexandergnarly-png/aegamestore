import { siteConfig } from "@/lib/site";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-sky-100 bg-white/85 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-rose-400 text-lg font-black text-white shadow-sm">
            AE
          </div>

          <div>
            <p className="text-sm font-black leading-tight text-sky-950">
              {siteConfig.name}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {siteConfig.tagline}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#catalog"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-100 hover:text-sky-700"
          >
            Catalog
          </a>

          <a
            href="#benefits"
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-100 hover:text-sky-700"
          >
            Benefits
          </a>

          <a
            href={siteConfig.links.login}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-sky-100 hover:text-sky-700"
          >
            Login
          </a>

          <a
            href={siteConfig.links.support}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
          >
            Support
          </a>
        </div>

        <a
          href="#catalog"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-black text-white shadow-sm md:hidden"
        >
          Catalog
        </a>
      </div>
    </nav>
  );
}
