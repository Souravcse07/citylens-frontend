// CityLens Service Worker — PWA offline support
const CACHE_NAME = "citylens-v1";

// Assets to cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Install: pre-cache shell ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fallback to cache ───────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external API requests (MongoDB, OSRM, etc.)
  if (request.method !== "GET") return;
  if (url.origin !== location.origin &&
      !url.hostname.endsWith("tile.openstreetmap.org")) return;

  // Map tiles — cache-first (tiles don't change)
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(
      caches.open("citylens-tiles").then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // App shell — network-first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push Notifications (future) ───────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "CityLens", {
      body: data.body || "New update from CityLens",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});