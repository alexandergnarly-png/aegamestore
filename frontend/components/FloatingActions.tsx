"use client";

import { siteConfig } from "@/lib/site";

export function FloatingActions() {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
      <a
        href={siteConfig.links.support}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-lg text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600"
        aria-label="Telegram support"
      >
        💬
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-lg text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600"
        aria-label="Back to top"
      >
        ↑
      </button>
    </div>
  );
}
