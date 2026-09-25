// Keeps the card working offline once it's been opened (or added to the home screen).
// Bump VERSION whenever you change any file so phones pick up the update.
const VERSION = 'card-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'qrcode.min.js', 'poster.jpg', 'mark.png', 'wordmark.png',
  'contact-photo.jpg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.url.endsWith('.mp4')) return; // video streams from the network; the poster shows when offline
  // Page: network first so edits show up, cache as fallback. Assets: cache first.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
