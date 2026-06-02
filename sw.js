/**
 * sw.js — 極速食光 Service Worker v2.0
 * =====================================================
 * 策略：
 *   主要靜態資源 (HTML/CSS/JS) → Cache-First with Background Revalidation
 *   Google Fonts               → Stale-While-Revalidate
 *   離線備援                   → 回傳快取的 index.html
 *
 * 功能：確保職業婦女在廚房 Wi-Fi 訊號不穩時，App 仍可正常使用
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `express-dinner-${CACHE_VERSION}`;
const FONT_CACHE = `express-dinner-fonts-${CACHE_VERSION}`;

// 預快取的靜態資源清單
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './apple-touch-icon.png',
];

// ==================== 安裝：預快取靜態資源 ====================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 正在預快取靜態資源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] 安裝完成，強制接管頁面');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] 預快取失敗：', err))
  );
});

// ==================== 啟動：清除舊版快取 ====================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name =>
            name.startsWith('express-dinner-') &&
            name !== CACHE_NAME &&
            name !== FONT_CACHE
          )
          .map(name => {
            console.log('[SW] 刪除舊快取：', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] 已接管所有頁面');
      return self.clients.claim();
    })
  );
});

// ==================== 攔截請求：策略路由 ====================
self.addEventListener('fetch', event => {
  const { request } = event;

  // 只處理 GET 請求
  if (request.method !== 'GET') return;

  // 跳過瀏覽器擴充功能請求
  if (request.url.startsWith('chrome-extension://')) return;

  // Google Fonts → Stale-While-Revalidate（離線可用快取字型）
  if (
    request.url.includes('fonts.googleapis.com') ||
    request.url.includes('fonts.gstatic.com')
  ) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // 主要靜態資源 → Cache-First（廚房離線最重要）
  event.respondWith(cacheFirst(request));
});

// ==================== 快取策略函式 ====================

/**
 * Cache-First：先讀快取，同時在背景靜默更新。
 * 若快取與網路皆無法取得，導航請求會回傳離線備援首頁。
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    // 在背景靜默更新快取（Stale 但立即可用）
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response));
        }
      })
      .catch(() => {}); // 離線時靜默失敗
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 離線備援：導航請求回傳首頁 HTML
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      return (
        fallback ||
        new Response(
          `<html lang="zh-TW"><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h1>📱 目前離線中</h1>
            <p>請連線後再試，或從「加入主畫面」後開啟，即可在廚房離線使用極速食光！</p>
           </body></html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      );
    }
    throw new Error('[SW] 離線且無快取可用');
  }
}

/**
 * Stale-While-Revalidate：立即回傳快取，背景更新。
 * 適合 Google Fonts 等變動性低的第三方資源。
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise);
}
