const CACHE_NAME = 'lavanderia-aj-v3';
const ASSETS_TO_CACHE = [
  '/', 
  '/index.html', 
  '/manifest.json', 
  '/pwa-icon-192.png', 
  '/pwa-icon-512.png', 
  '/pwa-icon-maskable-192.png', 
  '/pwa-icon-maskable-512.png', 
  '/apple-touch-icon.png', 
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Estrategia Network-First para documentos y páginas (garantiza que siempre veas la última versión)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Para navegación y HTML, siempre buscar en internet primero
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match('/index.html'))
    );
    return;
  }

  // Para otros recursos (imágenes, fuentes, etc.)
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});