/* MatchPoint service worker — app-shell caching + offline fallback. */
const VERSION = 'matchpoint-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache API traffic — always go to network so bookings are live.
  const isApi = url.pathname.includes('/api/') || url.pathname.startsWith('/api');
  if (req.method !== 'GET' || isApi) {
    event.respondWith(fetch(req).catch(() => Response.error()));
    return;
  }

  // Same-origin shell + assets: cache-first, fall back to network, then to shell.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Cross-origin (fonts, etc.): stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
