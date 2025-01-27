const CACHE_NAME = 'static-cache-v1'
const CACHE_URLS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/service-worker.js',
  '/assets/**',
]

/** 1 控制缓存内容 */
self.addEventListener('install', async event => {
  console.log('install-12', event)
  // 打开缓存，并添加缓存内容
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(CACHE_URLS)
  // 让 service worker 跳过等待，尽快被激活
  await self.skipWaiting()
});

/** 2 清除旧的缓存 */
self.addEventListener('activate', async event => {
  console.log('activate', event)
  // 获取所有缓存名称
  const keys = await caches.keys()
  keys.forEach(key => {
    if (key !== CACHE_NAME) {
      caches.delete(key)
    }
  })

  // 表示 当前的 service worker 已经激活，立即获取 service worker 控制权
  await self.clients.claim()
});

/** 3 拦截请求，返回缓存内容 */
self.addEventListener('fetch', async event => {
  // 请求对象
  const request = event.request
  // 给浏览器响应
  event.respondWith(networkFirst(request))
});


/** 网络优先 */
async function networkFirst(request) {
  try {
    // 尝试从网络获取资源
    const fresh = await fetch(request)
    // 更新缓存资源
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, fresh.clone())
    // 返回资源
    return fresh
  } catch (e) {
    // 如果网络请求失败，则从缓存中获取资源
    const cache = await caches.open(CACHE_NAME)
    return cache.match(request)
  }
}

/** 缓存优先 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME + CACHE_VERSION)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    // 如果缓存中没有资源，则从网络请求资源
    const fresh = await fetch(request)
    // 更新缓存资源
    cache.put(request, fresh.clone())
    // 返回资源

  } catch (e) {
    console.log('cacheFirst-error', e)
  }
}