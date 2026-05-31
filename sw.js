const CACHE_NAME = 'udaan-sf26-v1';

// Only cache the shell — Firebase and images load fresh
const STATIC_ASSETS = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Let Firebase, ibb.co, fonts, CDN calls go through fresh every time
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('ibb.co') ||
    url.hostname.includes('fonts.g') ||
    url.hostname.includes('jsdelivr') ||
    url.hostname.includes('pinimg') ||
    url.hostname.includes('githubusercontent')
  ) {
    return; // don't intercept, browser handles normally
  }

  // For your own HTML/CSS/JS: cache-first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});