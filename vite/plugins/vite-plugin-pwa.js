import { VitePWA } from 'vite-plugin-pwa'

export default function createPwa() {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'OK云 ERP管理系统',
      short_name: 'OK云',
      description: '一站式 进销存管理系系统 ',
      theme_color: '#5c6ac4',
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
      // 自定义缓存策略等
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/dev-api\.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 360000,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache'
          }
        }
      ],
      // 预缓存特定模块的路由
      globPatterns: [
        '/assets/**/*',
        '/views/**/*'
      ]
    },
    // 开发环境开启
    devOptions: {
      enabled: true
    },

  })
}