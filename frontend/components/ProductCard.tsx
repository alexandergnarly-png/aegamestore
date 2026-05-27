export type Product = {
  id: number;
  game: string;
  brand: string;
  duration: string;
  price: number;
  active: number;
  delivery_type?: string;
  stock?: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getDeliveryLabel(type?: string) {
  const deliveryType = String(type || "auto").toLowerCase();

  if (deliveryType === "manual") {
    return "Manual";
  }

  return "Auto";
}
function normalizeGameName(game: string) {
  return String(game || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getGameThumbnail(game: string) {
  const normalized = normalizeGameName(game);

  const thumbnails: Record<string, string> = {
    deltaforce:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2507950/header.jpg",
    pubgm:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    pubgmobile:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    bloodstrike: "https://www.blood-strike.com/favicon.ico",
    freefire:
      "https://play-lh.googleusercontent.com/6llpraFcTI0rEUuRpWEG9NWWblvm106y5JXcDzu60ACuaUYDD3i70a-p9_QM65NsGDE=s512",
    mlbb: "https://play-lh.googleusercontent.com/7nVY1HnQwxS65U6k7PRkDmW4N-1Jwdx0j5JqR68ZtIyM36Z7S6cQLal8hcdR4Pl0Tw=s512",
    mobilelegends:
      "https://play-lh.googleusercontent.com/7nVY1HnQwxS65U6k7PRkDmW4N-1Jwdx0j5JqR68ZtIyM36Z7S6cQLal8hcdR4Pl0Tw=s512",
    codm: "https://play-lh.googleusercontent.com/3rU1PpO9wq0wVQIEV2ODNVJjJdxZB7Y6zjB8Fh91m5nMZT3sZml0j63QXK-DfM7v3g=s512",
    callofdutymobile:
      "https://play-lh.googleusercontent.com/3rU1PpO9wq0wVQIEV2ODNVJjJdxZB7Y6zjB8Fh91m5nMZT3sZml0j63QXK-DfM7v3g=s512",
  };

  return thumbnails[normalized] || "";
}

function getGameInitials(game: string) {
  return String(game || "AE")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function ProductCard({ product }: { product: Product }) {
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const deliveryLabel = getDeliveryLabel(product.delivery_type);
  const thumbnail = getGameThumbnail(product.game);
  const initials = getGameInitials(product.game);

  return (
    <article
      className={`group rounded-3xl bg-white p-4 shadow-sm ring-1 transition ${
        isOutOfStock
          ? "opacity-70 ring-slate-100"
          : "ring-sky-100 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-rose-100 ring-1 ring-sky-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={product.game}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black text-sky-700">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-wide text-sky-500">
              {product.brand}
            </div>

            <h3 className="mt-1 truncate text-lg font-black text-sky-950">
              {product.game}
            </h3>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            deliveryLabel === "Manual"
              ? "bg-amber-100 text-amber-700"
              : "bg-sky-100 text-sky-700"
          }`}
        >
          {deliveryLabel}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-500">
        {product.duration}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isOutOfStock
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isOutOfStock ? "Stock empty" : `${stock} stock ready`}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          Instant result page
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Start from</p>
          <p className="text-lg font-black text-sky-700">
            {formatRupiah(product.price)}
          </p>
        </div>

        {isOutOfStock ? (
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">
            Sold Out
          </span>
        ) : (
          <a
            href={`https://aegamestore.com/?game=${encodeURIComponent(
              product.game,
            )}`}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-600"
          >
            Buy
          </a>
        )}
      </div>
    </article>
  );
}
