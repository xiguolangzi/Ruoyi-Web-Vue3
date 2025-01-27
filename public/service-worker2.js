const CACHE_NAME = 'static-cache-v6'
const CACHE_URLS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/service-worker.js',
  '/assets',
  '/finance'
]

/** 1 控制缓存内容 */
self.addEventListener('install', async event => {
  console.log('install-12', event)
  // 1.1 打开缓存，并添加缓存内容
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(CACHE_URLS)
  // 1.2 让 service worker 跳过等待，尽快被激活
  await self.skipWaiting()
});

/** 2 清除旧的缓存 */
self.addEventListener('activate', async event => {
  console.log('activate', event)
  // 2.1 获取所有缓存名称
  const keys = await caches.keys()
  // 2.2 清除old' 缓存名称，删除
  keys.forEach(key => {
    if (key !== CACHE_NAME) {
      caches.delete(key)
    }
  })
  // 2.3 表示 当前的 service worker 已经激活，立即获取 service worker 控制权
  await self.clients.claim()
});

/** 3 拦截请求，返回缓存内容 */
self.addEventListener('fetch', async event => {
  // 1 缓存同源数据
  const request = event.request
  const url = new URL(request.url)
  if (url.origin !== location.origin) {
    return;
  }
  // 给浏览器响应 - 根据url 是否包含 api 区分 网络优先/缓存优先
  if (url.pathname.startsWith('/dev-api')) {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(cacheFirst(request))
  }

});


// --------------------------- 缓存策略 start ---------------------------
/** 1 网络优先 (动态数据) */
async function networkFirst(req) {
  console.log('网络优先-----', req)
  const cache = await caches.open(CACHE_NAME)
  try {
    // 尝试从网络获取资源
    const fresh = await fetch(req)
    // 更新缓存资源
    cache.put(req, fresh.clone())
    // 返回资源
    return fresh
  } catch (e) {
    // 如果网络请求失败，则从缓存中获取资源
    const cached = await cache.match(req)
    return cached
  }
}

/** 2 缓存优先 (静态数据) */
async function cacheFirst(req) {
  console.log('缓存优先-----', req)
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(req)
  // 缓存中有数据，直接返回缓存数据
  if (cached) {
    return cached
  } else {
    return fetch(req)
  }
}

/** 3 避免跨域数据缓存 */

// --------------------------- 缓存策略 end ---------------------------