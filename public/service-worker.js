// AE Game Store Service Worker
// v4 — defensive responses: never resolve respondWith() with undefined,
// always return a valid Response object so the browser doesn't fall back
// to the offline page on transient sub-resource fails.

const CACHE_VERSION = "20260811-ai-white-v1";
const CACHE_NAME = `ae-game-store-auto-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/style.css",
  "/keysystem-ui.css",
  "/script.js",
  "/manifest.json",
  "/offline.html",
  "/account.html",
  "/result.html",
];

// Paths the SW should NOT intercept at all (admin, auth, favicon, etc).
// Each entry: prefix match against URL pathname.
const SW_BYPASS_PREFIXES = [
  "/admin",
  "/admin-",
  "/auth",
  "/ae-control",
  "/api/admin",
  "/midtrans-notification",
];

// Dynamic API paths: always go to network, never cached by SW.
const DYNAMIC_PREFIXES = [
  "/public-products",
  "/public-vouchers",
  "/trending-products",
  "/api/",
  "/reviews",
  "/recent-purchases",
  "/voucher-preview",
  "/create-order",
  "/user/",
  "/orders",
  "/order/",
];

function emptyResponse(status = 504, statusText = "Gateway Timeout") {
  return new Response("", {
    status,
    statusText,
    headers: { "Content-Type": "text/plain" },
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // allSettled — kalau satu file gagal pre-cache, jangan bikin install fail
      Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] precache failed:", url, err && err.message);
          }),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GET requests for our origin
  if (request.method !== "GET") return;

  let requestUrl;
  try {
    requestUrl = new URL(request.url);
  } catch (_) {
    return;
  }
  if (requestUrl.origin !== self.location.origin) return;

  const pathname = requestUrl.pathname;

  // 1. Hard bypass — biarkan browser handle native
  if (SW_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  // 2. Dynamic API endpoints — biarkan browser handle native
  if (DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  // 3. Versioned static assets -> network first
  if (
    ["/script.js", "/style.css", "/keysystem-ui.css"].includes(pathname) &&
    requestUrl.search
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || emptyResponse()),
        ),
    );
    return;
  }

  // 4. Navigation requests -> network first, fallback ke offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html").then(
          (cached) =>
            cached ||
            new Response(
              "<h1>Offline</h1><p>Buka koneksi internet & refresh.</p>",
              {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              },
            ),
        ),
      ),
    );
    return;
  }

  // 5. Default — stale-while-revalidate untuk static assets lain
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          // Hanya cache response yang sukses + basic (same-origin)
          if (
            response &&
            response.ok &&
            (response.type === "basic" || response.type === "default")
          ) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => null);

      // Kalau ada cache, return cache + update di background
      if (cached) {
        networkFetch.catch(() => {});
        return cached;
      }

      // Kalau gak ada cache, tunggu network; kalau network gagal, return empty Response (bukan undefined!)
      return networkFetch.then((response) => response || emptyResponse());
    }),
  );
});
