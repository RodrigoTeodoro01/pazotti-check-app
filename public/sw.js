const CACHE_NAME = 'pazotti-check-cache-v2';
const ASSETS_TO_CACHE = [
  '/pazotti-check-app/',
  '/pazotti-check-app/index.html',
  '/pazotti-check-app/manifest.json',
  '/pazotti-check-app/pazotti-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First: tenta rede primeiro, depois cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta da rede for válida, atualiza o cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Sem rede: serve do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback para navegação offline
          if (event.request.mode === 'navigate') {
            return caches.match('/pazotti-check-app/');
          }
        });
      })
  );
});
