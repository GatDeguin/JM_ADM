const VERSION = "jm-adm-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const OFFLINE_PAGE = "/offline";

const SHELL_URLS = [
  "/",
  "/inicio",
  "/buscar",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/apple-touch-icon.svg",
  "/splash/apple-splash-1179x2556.svg",
  "/splash/apple-splash-1290x2796.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  const destination = request.destination;
  if (["style", "script", "image", "font"].includes(destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (_error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const fallback = await caches.match(OFFLINE_PAGE);
    return (
      fallback ||
      new Response("Sin conexión", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}
