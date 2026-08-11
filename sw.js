/* かく 서비스워커 v3
   전략:
   - 앱 셸(index.html, sw.js): 네트워크 우선 → 항상 최신 버전, 오프라인일 때만 캐시
   - 데이터·아이콘: 캐시 우선 → 빠르고 오프라인 동작 (데이터는 ?v= 쿼리로 버전 관리)
   - 설치 시 cache:'reload'로 HTTP 캐시를 우회해 항상 신선한 파일을 담음 */
const CACHE = 'kaku-v3';
const ASSETS = [
  './',
  './index.html',
  './data.js',
  './data_jlpt.js?v=4',
  './data_kanji.js?v=4',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(ASSETS.map(u =>
        fetch(new Request(u, { cache: 'reload' })).then(res => { if (res.ok) return c.put(u, res); })
          .catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  const path = new URL(e.request.url).pathname;
  const isShell = path.endsWith('/') || path.endsWith('index.html');

  if (isShell) {
    // 네트워크 우선: 새 배포가 바로 반영, 오프라인이면 캐시
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
  } else {
    // 캐시 우선: 데이터·아이콘
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }))
    );
  }
});
