const CACHE_NAME = 'reichshof-emergency-v1';
const CORE_ASSETS = [
  './',
  './digital-concierge-reichshof.html',
  './js/data/pdf-map.js',
  './js/script.js',
  './css/style.css',
  './manifest.json',
  './img/logo-192.png',
  './img/logo-450.png'
];

const PDF_ASSETS = [
  './pdf/1og.pdf',
  './pdf/2og.pdf',
  './pdf/3og.pdf',
  './pdf/4og.pdf',
  './pdf/5og.pdf',
  './pdf/6og.pdf',
  './pdf/zg.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...CORE_ASSETS, ...PDF_ASSETS]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((k) => k !== CACHE_NAME)
      .map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./digital-concierge-reichshof.html'));
    })
  );
});
