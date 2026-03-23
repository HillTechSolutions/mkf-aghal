/* MKF Aghal - Service Worker v1.0 by HillTech Solutions */
var CACHE_NAME = 'mkf-aghal-v1';
var URLS_TO_CACHE = [
  '/mkf-aghal/',
  '/mkf-aghal/mkf-aghal.html',
  '/mkf-aghal/mkf-owner-dashboard.html',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Bebas+Neue&display=swap'
];

/* Install - cache all resources */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('MKF SW: Caching app shell');
      return cache.addAll(URLS_TO_CACHE).catch(function(err) {
        console.log('MKF SW: Some cache failed (ok):', err);
      });
    })
  );
  self.skipWaiting();
});

/* Activate - clean old caches */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch - serve from cache, fallback to network */
self.addEventListener('fetch', function(event) {
  /* Skip non-GET and browser-extension requests */
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('chrome-extension') > -1) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        /* Cache successful responses */
        if (response && response.status === 200 && response.type === 'basic') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function() {
        /* Offline fallback */
        return caches.match('/mkf-aghal/mkf-aghal.html');
      });
    })
  );
});
