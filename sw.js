const CACHE = 'poker-coach-v2';
const FILES = ['./', 'index.html', 'css/style.css', 'js/poker.js', 'js/game.js', 'js/cardui.js', 'js/quizgen.js', 'js/lessons.js', 'js/app.js', 'js/play.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
// Ağ öncelikli: güncellemeler hemen gelsin, çevrimdışıyken önbellek kullanılsın
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
