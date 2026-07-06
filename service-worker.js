/**
 * Vela PWA — Service Worker
 * Strategy : Cache-First for static assets, Network-First for API calls
 * Offline   : Full offline support via pre-cached app shell
 */

const APP_VERSION  = 'v1.0.0';
const CACHE_STATIC = `vela-static-${APP_VERSION}`;
const CACHE_DYNAMIC = `vela-dynamic-${APP_VERSION}`;

// ─── App Shell: all files to pre-cache on install ───────────────────────────
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/images/logo.svg',
  '/images/splash-bg.svg',
  '/images/card-bg.svg',
  '/images/avatar-placeholder.svg',
  '/images/qr-sample.svg',
  '/assets/colors.css',
  // Google Fonts — cached on first fetch
  'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL@20,400,0..1'
];

// ─── INSTALL: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', event => {
  console.log(`[SW] Installing ${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Pre-caching app shell');
        // Cache files individually so one failure doesn't abort all
        return Promise.allSettled(
          STATIC_FILES.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log(`[SW] Activating ${APP_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
            .map(key => {
              console.log(`[SW] Deleting old cache: ${key}`);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── FETCH: routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.protocol === 'moz-extension:') return;

  // Strategy 1 — Google Fonts: Cache-First (they never change)
  if (url.hostname.includes('fonts.g') || url.hostname.includes('fonts.googleapis')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Strategy 2 — App Shell (static assets): Cache-First with network fallback
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Strategy 3 — Navigation (HTML pages): Network-First, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Strategy 4 — Everything else: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
});

// ─── Caching Strategies ───────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache-first fetch failed:', err);
    return offlineFallback(request);
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Serve the app shell for any failed navigation
    const shell = await caches.match('/index.html');
    return shell || offlineFallback(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

function offlineFallback(request) {
  if (request.destination === 'image') {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="14" fill="#0E1420"/>
        <text x="50" y="58" text-anchor="middle" font-size="34" fill="#5A6678">⚠</text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vela — Offline</title>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>*{margin:0;padding:0;box-sizing:border-box;}' +
    'body{background:#070B11;color:#F4F7FA;font-family:Inter,sans-serif;' +
    'display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;}' +
    '.wrap{max-width:340px;}' +
    '.icon{font-size:52px;margin-bottom:18px;}' +
    'h1{font-size:22px;font-weight:700;margin-bottom:10px;}' +
    'p{color:#92A0B3;font-size:14px;line-height:1.6;margin-bottom:24px;}' +
    'button{background:linear-gradient(135deg,#1FE08A,#1E9BFF);color:#04140E;' +
    'border:none;border-radius:16px;padding:14px 28px;font-weight:700;font-size:15px;cursor:pointer;}' +
    '</style></head>' +
    '<body><div class="wrap"><div class="icon">📡</div>' +
    '<h1>You\'re offline</h1>' +
    '<p>Vela needs a connection for this action. Your last session data is still available.</p>' +
    '<button onclick="location.reload()">Try Again</button>' +
    '</div></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}

function isStaticAsset(url) {
  const staticExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg',
                      '.ico', '.woff', '.woff2', '.ttf', '.webp'];
  return staticExts.some(ext => url.pathname.endsWith(ext));
}

// ─── BACKGROUND SYNC ──────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'vela-transaction-sync') {
    event.waitUntil(syncPendingTransactions());
  }
});

async function syncPendingTransactions() {
  // In production: retrieve queued transactions from IndexedDB and retry
  console.log('[SW] Syncing pending transactions...');
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {
    title: 'Vela',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/favicon-32x32.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon   || '/icons/icon-192x192.png',
      badge:   data.badge  || '/icons/favicon-32x32.png',
      tag:     data.tag    || 'vela-notification',
      data:    data.url    || '/',
      vibrate: [200, 100, 200],
      actions: data.actions || [
        { action: 'view',   title: 'View'    },
        { action: 'dismiss',title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

// ─── MESSAGE CHANNEL (version updates) ───────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: APP_VERSION });
  }
});
