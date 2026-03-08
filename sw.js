// KisanSpray Service Worker - Offline Support
const CACHE_NAME = 'kisanspray-v3';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Install - cache all assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache Google Fonts and other external resources
        if (e.request.url.includes('fonts.googleapis.com') ||
            e.request.url.includes('fonts.gstatic.com')) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // If both cache and network fail, return index.html
        return caches.match('./index.html');
      });
    })
  );
});
