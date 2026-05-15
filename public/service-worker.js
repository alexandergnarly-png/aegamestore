const CACHE_NAME = "ae-game-store-v13";

const STATIC_ASSETS = [
  "/",
  "/style.css?v=44",
  "/script.js?v=42",
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
      ),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== "GET") {
    return;
  }

  // Jangan ganggu request gambar/file dari domain luar
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Jangan cache API/data dinamis tapi tetap fallback offline buat navigasi
  if (
    requestUrl.pathname.startsWith("/public-products") ||
    requestUrl.pathname.startsWith("/public-vouchers") ||
    requestUrl.pathname.startsWith("/trending-products") ||
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/reviews") ||
    requestUrl.pathname.startsWith("/recent-purchases") ||
    requestUrl.pathname.startsWith("/voucher-preview") ||
    requestUrl.pathname.startsWith("/create-order") ||
    requestUrl.pathname.startsWith("/user/")
  ) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached || caches.match("/offline.html")),
      ),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
