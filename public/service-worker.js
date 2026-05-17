const CACHE_NAME = "ae-game-store-auto-v2";

const STATIC_ASSETS = [
  "/",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
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

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") return;
  if (requestUrl.origin !== self.location.origin) return;

  const isDynamicRequest =
    requestUrl.pathname.startsWith("/public-products") ||
    requestUrl.pathname.startsWith("/public-vouchers") ||
    requestUrl.pathname.startsWith("/trending-products") ||
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/reviews") ||
    requestUrl.pathname.startsWith("/recent-purchases") ||
    requestUrl.pathname.startsWith("/voucher-preview") ||
    requestUrl.pathname.startsWith("/create-order") ||
    requestUrl.pathname.startsWith("/user/") ||
    requestUrl.pathname.startsWith("/orders") ||
    requestUrl.pathname.startsWith("/order/") ||
    requestUrl.pathname.startsWith("/admin-orders") ||
    requestUrl.pathname.startsWith("/admin-") ||
    requestUrl.pathname.startsWith("/ae-control") ||
    requestUrl.pathname.startsWith("/ae-auth");

  if (isDynamicRequest) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html")),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      })
      .catch(() => caches.match(request)),
  );
});
