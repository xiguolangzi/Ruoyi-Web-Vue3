import { VitePWA } from 'vite-plugin-pwa'

export default function createPwa() {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'OK云 ERP管理系统',
      short_name: 'OK云',
      start_url: '/index.html',
      description: '一站式 进销存管理系系统 ',
      theme_color: '#5c6ac4',
      background_color: '#ffffff',
      icons: [
        {
          src: 'icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      screenshots: [
        {
          src: 'screenshots/screenshot-800x600.png',
          sizes: '800x600',
          type: 'image/png',
          form_factor: "wide"
        },
        {
          src: 'screenshots/screenshot-320x320.png',
          sizes: '320x320',
          type: 'image/png',
          form_factor: "narrow"
        }
      ]
    },
    workbox: {
      // 清除过期的缓存
      cleanupOutdatedCaches: true,
      // 生产环境下构建 sw.js
      sourcemap: true, // 禁用生产环境的 Source Maps
      // 静态资源缓存
      globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
      // 自定义缓存策略等
      runtimeCaching: [
        {
          urlPattern: /\/dev-api\/finance\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'finance-data-v1',
            cacheableResponse: {
              statuses: [0, 200]
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            }
          }
        },
        {
          urlPattern: /\/dev-api\/product\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'product-data-v1',
            cacheableResponse: {
              statuses: [0, 200]
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            }
          }
        },
        {
          urlPattern: /.*\.(?:js|css|html|png|svg|woff2?)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets-v1',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        }
      ],
    },
    // 开发环境开启
    devOptions: {
      enabled: true
    },

  })
}