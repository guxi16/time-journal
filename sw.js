const CACHE = 'timejournal-v17';
const FILES = [
  '/','/index.html','/css/style.css','/manifest.json',
  '/js/storage.js','/js/icons.js','/js/i18n.js','/js/inquiry.js',
  '/js/scheduler.js','/js/review.js','/js/achievements.js',
  '/js/weekly.js','/js/chart.js','/js/treehole.js','/js/tarot.js',
  '/js/breathing.js','/js/music.js','/js/lifebook.js',
  '/js/settings.js','/js/app.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE).map(n => caches.delete(n))
    ))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});