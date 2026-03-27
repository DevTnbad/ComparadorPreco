const CACHE_NAME = "compara-preco-cache-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./history.html",
  "./style.css",
  "./app.js",
  "./history.js",
  "./storage.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Só trata recursos do próprio app
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML / navegação: tenta rede primeiro, depois cache
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  // CSS / JS / manifest / imagens: responde rápido do cache,
  // mas atualiza em segundo plano
  if (
    ["style", "script", "worker", "manifest", "image"].includes(
      request.destination
    )
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Restante: cache first simples
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request, fallbackUrl) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || networkPromise;
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}