/**
 * sw.js — Minimal offline app-shell cache.
 * Caches HTML/CSS/JS (the countdown logic) so the page keeps
 * ticking even if the network drops after first load. Images and
 * audio are cached opportunistically as they're requested, not
 * pre-cached, so a missing asset never blocks install.
 */
const CACHE_NAME = "bfc-shell-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/responsive.css",
  "./js/festivals.js",
  "./js/storage.js",
  "./js/countdown.js",
  "./js/theme.js",
  "./js/audio.js",
  "./js/effects.js",
  "./js/app.js",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {
        /* If pre-caching fails (e.g. offline install), don't block —
           the site still works online and will cache opportunistically. */
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Opportunistically cache same-origin images/audio/core files.
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // stays undefined if truly unavailable — page handles missing assets gracefully
    })
  );
});
