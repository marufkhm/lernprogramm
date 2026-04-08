"use strict";

const CACHE_NAME = "lernprogramm-v54";

// Files to cache for offline use
const CACHE_URLS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/model.js",
  "./js/view.js",
  "./js/presenter.js",
  "./data/fragen.json",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/vexflow/4.2.2/vexflow.js"
];

// Install: cache all static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Service Worker: Caching Dateien");
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for local assets, Network-first for API
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Network-first for external API
  if (url.hostname !== self.location.hostname &&
      !url.hostname.includes("cdnjs.cloudflare.com")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first for local/CDN assets
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline – Ressource nicht verfügbar", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}
