/* MKF Aghal - Service Worker v8 by HillTech Solutions */
var CACHE_NAME = 'mkf-aghal-v8';

/* Only cache CDN libraries - NEVER cache HTML files */
var CDN_TO_CACHE = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

/* Install */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CDN_TO_CACHE).catch(function(err) {
        console.log('MKF SW: CDN cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

/* Activate - delete ALL old caches */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

/* Fetch:
   HTML files  → ALWAYS network fresh (no-store)
   CDN libs    → cache first
   Others      → network first
*/
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('chrome-extension') > -1) return;

  var url = event.request.url;

  /* HTML - never cache, always fresh */
  if (url.indexOf('.html') > -1) {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'}).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  /* CDN - cache first */
  if (url.indexOf('cdnjs.cloudflare.com') > -1 ||
      url.indexOf('fonts.googleapis.com') > -1 ||
      url.indexOf('fonts.gstatic.com') > -1) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request).then(function(res) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
          return res;
        });
      })
    );
    return;
  }

  /* Default - network first */
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
