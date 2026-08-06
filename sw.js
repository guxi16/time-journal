const CACHE = 'timejournal-v28';
// 基于部署路径动态拼接（兼容 GitHub Pages 子路径 /time-journal/）
const BASE = self.registration.scope;
const FILES = [
  BASE,
  BASE + 'index.html', BASE + 'css/style.css', BASE + 'manifest.json',
  BASE + 'js/storage.js', BASE + 'js/icons.js', BASE + 'js/i18n.js', BASE + 'js/inquiry.js',
  BASE + 'js/scheduler.js', BASE + 'js/review.js', BASE + 'js/achievements.js',
  BASE + 'js/weekly.js', BASE + 'js/chart.js', BASE + 'js/treehole.js', BASE + 'js/tarot.js',
  BASE + 'js/breathing.js', BASE + 'js/music.js', BASE + 'js/lifebook.js',
  BASE + 'js/settings.js', BASE + 'js/sleep.js', BASE + 'js/app.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(err => console.warn('SW cache failed:', err)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE).map(n => caches.delete(n))
    ))
  );
});

self.addEventListener('fetch', e => {
  // 只处理同源请求
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      // 网络成功则更新缓存
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
