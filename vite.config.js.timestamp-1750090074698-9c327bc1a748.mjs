// vite.config.js
import { defineConfig, loadEnv } from "file:///E:/java/project/RuoYi-Vue3/node_modules/vite/dist/node/index.js";
import path2 from "path";

// vite/plugins/index.js
import vue from "file:///E:/java/project/RuoYi-Vue3/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// vite/plugins/auto-import.js
import autoImport from "file:///E:/java/project/RuoYi-Vue3/node_modules/unplugin-auto-import/dist/vite.js";
function createAutoImport() {
  return autoImport({
    imports: [
      "vue",
      "vue-router",
      "pinia"
    ],
    dts: false
  });
}

// vite/plugins/svg-icon.js
import { createSvgIconsPlugin } from "file:///E:/java/project/RuoYi-Vue3/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import path from "path";
function createSvgIcon(isBuild) {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), "src/assets/icons/svg")],
    symbolId: "icon-[dir]-[name]",
    svgoOptions: isBuild
  });
}

// vite/plugins/compression.js
import compression from "file:///E:/java/project/RuoYi-Vue3/node_modules/vite-plugin-compression/dist/index.mjs";
function createCompression(env) {
  const { VITE_BUILD_COMPRESS } = env;
  const plugin = [];
  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(",");
    if (compressList.includes("gzip")) {
      plugin.push(
        compression({
          ext: ".gz",
          deleteOriginFile: false
        })
      );
    }
    if (compressList.includes("brotli")) {
      plugin.push(
        compression({
          ext: ".br",
          algorithm: "brotliCompress",
          deleteOriginFile: false
        })
      );
    }
  }
  return plugin;
}

// vite/plugins/setup-extend.js
import setupExtend from "file:///E:/java/project/RuoYi-Vue3/node_modules/unplugin-vue-setup-extend-plus/dist/vite.js";
function createSetupExtend() {
  return setupExtend({});
}

// vite/plugins/vite-plugin-pwa.js
import { VitePWA } from "file:///E:/java/project/RuoYi-Vue3/node_modules/vite-plugin-pwa/dist/index.js";
function createPwa() {
  return VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    manifest: {
      name: "OK\u4E91 ERP\u7BA1\u7406\u7CFB\u7EDF",
      short_name: "OK\u4E91",
      start_url: "/index.html",
      description: "\u4E00\u7AD9\u5F0F \u8FDB\u9500\u5B58\u7BA1\u7406\u7CFB\u7CFB\u7EDF ",
      theme_color: "#5c6ac4",
      background_color: "#ffffff",
      icons: [
        {
          src: "icons/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "icons/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      screenshots: [
        {
          src: "screenshots/screenshot-800x600.png",
          sizes: "800x600",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "screenshots/screenshot-320x320.png",
          sizes: "320x320",
          type: "image/png",
          form_factor: "narrow"
        }
      ]
    },
    workbox: {
      // 清除过期的缓存
      cleanupOutdatedCaches: true,
      // 生产环境下构建 sw.js
      sourcemap: true,
      // 禁用生产环境的 Source Maps
      // 静态资源缓存
      globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}"],
      // 自定义缓存策略等
      runtimeCaching: [
        {
          urlPattern: /\/dev-api\/finance\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "finance-data-v1",
            cacheableResponse: {
              statuses: [0, 200]
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7
              // 7 days
            }
          }
        },
        {
          urlPattern: /\/dev-api\/product\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "product-data-v1",
            cacheableResponse: {
              statuses: [0, 200]
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7
              // 7 days
            }
          }
        },
        {
          urlPattern: /.*\.(?:js|css|html|png|svg|woff2?)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "static-assets-v1",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30
              // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    // 开发环境开启
    devOptions: {
      enabled: true
    }
  });
}

// vite/plugins/index.js
function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()];
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(createPwa());
  vitePlugins.push(createSvgIcon(isBuild));
  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}

// vite.config.js
var __vite_injected_original_dirname = "E:\\java\\project\\RuoYi-Vue3";
var vite_config_default = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV } = env;
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === "production" ? "/" : "/",
    plugins: createVitePlugins(env, command === "build"),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        "~": path2.resolve(__vite_injected_original_dirname, "./"),
        // 设置别名
        "@": path2.resolve(__vite_injected_original_dirname, "./src")
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    // 打包配置
    build: {
      // https://vite.dev/config/build-options.html
      sourcemap: command === "build" ? false : "inline",
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 2e3,
      rollupOptions: {
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    // vite 相关配置
    server: {
      port: 8888,
      host: "0.0.0.0",
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        "/dev-api": {
          target: "http://localhost:7070",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, "")
        },
        // springdoc proxy
        "^/v3/api-docs/(.*)": {
          target: baseUrl,
          changeOrigin: true
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAidml0ZS9wbHVnaW5zL2luZGV4LmpzIiwgInZpdGUvcGx1Z2lucy9hdXRvLWltcG9ydC5qcyIsICJ2aXRlL3BsdWdpbnMvc3ZnLWljb24uanMiLCAidml0ZS9wbHVnaW5zL2NvbXByZXNzaW9uLmpzIiwgInZpdGUvcGx1Z2lucy9zZXR1cC1leHRlbmQuanMiLCAidml0ZS9wbHVnaW5zL3ZpdGUtcGx1Z2luLXB3YS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxqYXZhXFxcXHByb2plY3RcXFxcUnVvWWktVnVlM1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovamF2YS9wcm9qZWN0L1J1b1lpLVZ1ZTMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgY3JlYXRlVml0ZVBsdWdpbnMgZnJvbSAnLi92aXRlL3BsdWdpbnMnXHJcblxyXG5cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpXHJcbiAgY29uc3QgeyBWSVRFX0FQUF9FTlYgfSA9IGVudlxyXG4gIHJldHVybiB7XHJcbiAgICAvLyBcdTkwRThcdTdGNzJcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTU0OENcdTVGMDBcdTUzRDFcdTczQUZcdTU4ODNcdTRFMEJcdTc2ODRVUkxcdTMwMDJcclxuICAgIC8vIFx1OUVEOFx1OEJBNFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ3ZpdGUgXHU0RjFBXHU1MDQ3XHU4QkJFXHU0RjYwXHU3Njg0XHU1RTk0XHU3NTI4XHU2NjJGXHU4OEFCXHU5MEU4XHU3RjcyXHU1NzI4XHU0RTAwXHU0RTJBXHU1N0RGXHU1NDBEXHU3Njg0XHU2ODM5XHU4REVGXHU1Rjg0XHU0RTBBXHJcbiAgICAvLyBcdTRGOEJcdTU5ODIgaHR0cHM6Ly93d3cucnVveWkudmlwL1x1MzAwMlx1NTk4Mlx1Njc5Q1x1NUU5NFx1NzUyOFx1ODhBQlx1OTBFOFx1N0Y3Mlx1NTcyOFx1NEUwMFx1NEUyQVx1NUI1MFx1OERFRlx1NUY4NFx1NEUwQVx1RkYwQ1x1NEY2MFx1NUMzMVx1OTcwMFx1ODk4MVx1NzUyOFx1OEZEOVx1NEUyQVx1OTAwOVx1OTg3OVx1NjMwN1x1NUI5QVx1OEZEOVx1NEUyQVx1NUI1MFx1OERFRlx1NUY4NFx1MzAwMlx1NEY4Qlx1NTk4Mlx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NEY2MFx1NzY4NFx1NUU5NFx1NzUyOFx1ODhBQlx1OTBFOFx1N0Y3Mlx1NTcyOCBodHRwczovL3d3dy5ydW95aS52aXAvYWRtaW4vXHVGRjBDXHU1MjE5XHU4QkJFXHU3RjZFIGJhc2VVcmwgXHU0RTNBIC9hZG1pbi9cdTMwMDJcclxuICAgIGJhc2U6IFZJVEVfQVBQX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gJy8nIDogJy8nLFxyXG4gICAgcGx1Z2luczogY3JlYXRlVml0ZVBsdWdpbnMoZW52LCBjb21tYW5kID09PSAnYnVpbGQnKSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgLy8gaHR0cHM6Ly9jbi52aXRlanMuZGV2L2NvbmZpZy8jcmVzb2x2ZS1hbGlhc1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1OERFRlx1NUY4NFxyXG4gICAgICAgICd+JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vJyksXHJcbiAgICAgICAgLy8gXHU4QkJFXHU3RjZFXHU1MjJCXHU1NDBEXHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxyXG4gICAgICB9LFxyXG4gICAgICAvLyBodHRwczovL2NuLnZpdGVqcy5kZXYvY29uZmlnLyNyZXNvbHZlLWV4dGVuc2lvbnNcclxuICAgICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXVxyXG4gICAgfSxcclxuICAgIC8vIFx1NjI1M1x1NTMwNVx1OTE0RFx1N0Y2RVxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvYnVpbGQtb3B0aW9ucy5odG1sXHJcbiAgICAgIHNvdXJjZW1hcDogY29tbWFuZCA9PT0gJ2J1aWxkJyA/IGZhbHNlIDogJ2lubGluZScsXHJcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnc3RhdGljL2pzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdzdGF0aWMvanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ3N0YXRpYy9bZXh0XS9bbmFtZV0tW2hhc2hdLltleHRdJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHZpdGUgXHU3NkY4XHU1MTczXHU5MTREXHU3RjZFXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogODg4OCxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgIC8vIGh0dHBzOi8vY24udml0ZWpzLmRldi9jb25maWcvI3NlcnZlci1wcm94eVxyXG4gICAgICAgICcvZGV2LWFwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NzA3MCcsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICByZXdyaXRlOiAocCkgPT4gcC5yZXBsYWNlKC9eXFwvZGV2LWFwaS8sICcnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gc3ByaW5nZG9jIHByb3h5XHJcbiAgICAgICAgJ14vdjMvYXBpLWRvY3MvKC4qKSc6IHtcclxuICAgICAgICAgIHRhcmdldDogYmFzZVVybCxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcG9zdGNzczoge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcG9zdGNzc1BsdWdpbjogJ2ludGVybmFsOmNoYXJzZXQtcmVtb3ZhbCcsXHJcbiAgICAgICAgICAgIEF0UnVsZToge1xyXG4gICAgICAgICAgICAgIGNoYXJzZXQ6IChhdFJ1bGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhdFJ1bGUubmFtZSA9PT0gJ2NoYXJzZXQnKSB7XHJcbiAgICAgICAgICAgICAgICAgIGF0UnVsZS5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxqYXZhXFxcXHByb2plY3RcXFxcUnVvWWktVnVlM1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxpbmRleC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovamF2YS9wcm9qZWN0L1J1b1lpLVZ1ZTMvdml0ZS9wbHVnaW5zL2luZGV4LmpzXCI7aW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcblxyXG5pbXBvcnQgY3JlYXRlQXV0b0ltcG9ydCBmcm9tICcuL2F1dG8taW1wb3J0J1xyXG5pbXBvcnQgY3JlYXRlU3ZnSWNvbiBmcm9tICcuL3N2Zy1pY29uJ1xyXG5pbXBvcnQgY3JlYXRlQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcclxuaW1wb3J0IGNyZWF0ZVNldHVwRXh0ZW5kIGZyb20gJy4vc2V0dXAtZXh0ZW5kJ1xyXG5pbXBvcnQgY3JlYXRlUHdhIGZyb20gJy4vdml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVZpdGVQbHVnaW5zKHZpdGVFbnYsIGlzQnVpbGQgPSBmYWxzZSkge1xyXG4gICAgY29uc3Qgdml0ZVBsdWdpbnMgPSBbdnVlKCldXHJcbiAgICB2aXRlUGx1Z2lucy5wdXNoKGNyZWF0ZUF1dG9JbXBvcnQoKSlcclxuICAgIHZpdGVQbHVnaW5zLnB1c2goY3JlYXRlU2V0dXBFeHRlbmQoKSlcclxuICAgIHZpdGVQbHVnaW5zLnB1c2goY3JlYXRlUHdhKCkpXHJcbiAgICB2aXRlUGx1Z2lucy5wdXNoKGNyZWF0ZVN2Z0ljb24oaXNCdWlsZCkpXHJcbiAgICBpc0J1aWxkICYmIHZpdGVQbHVnaW5zLnB1c2goLi4uY3JlYXRlQ29tcHJlc3Npb24odml0ZUVudikpXHJcbiAgICByZXR1cm4gdml0ZVBsdWdpbnNcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcamF2YVxcXFxwcm9qZWN0XFxcXFJ1b1lpLVZ1ZTNcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXGF1dG8taW1wb3J0LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9qYXZhL3Byb2plY3QvUnVvWWktVnVlMy92aXRlL3BsdWdpbnMvYXV0by1pbXBvcnQuanNcIjtpbXBvcnQgYXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQXV0b0ltcG9ydCgpIHtcclxuICAgIHJldHVybiBhdXRvSW1wb3J0KHtcclxuICAgICAgICBpbXBvcnRzOiBbXHJcbiAgICAgICAgICAgICd2dWUnLFxyXG4gICAgICAgICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICAgICAgICdwaW5pYSdcclxuICAgICAgICBdLFxyXG4gICAgICAgIGR0czogZmFsc2VcclxuICAgIH0pXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxqYXZhXFxcXHByb2plY3RcXFxcUnVvWWktVnVlM1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxzdmctaWNvbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovamF2YS9wcm9qZWN0L1J1b1lpLVZ1ZTMvdml0ZS9wbHVnaW5zL3N2Zy1pY29uLmpzXCI7aW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdmdJY29uKGlzQnVpbGQpIHtcclxuICAgIHJldHVybiBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcblx0XHRpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2Fzc2V0cy9pY29ucy9zdmcnKV0sXHJcbiAgICAgICAgc3ltYm9sSWQ6ICdpY29uLVtkaXJdLVtuYW1lXScsXHJcbiAgICAgICAgc3Znb09wdGlvbnM6IGlzQnVpbGRcclxuICAgIH0pXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxqYXZhXFxcXHByb2plY3RcXFxcUnVvWWktVnVlM1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxjb21wcmVzc2lvbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovamF2YS9wcm9qZWN0L1J1b1lpLVZ1ZTMvdml0ZS9wbHVnaW5zL2NvbXByZXNzaW9uLmpzXCI7aW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ29tcHJlc3Npb24oZW52KSB7XHJcbiAgICBjb25zdCB7IFZJVEVfQlVJTERfQ09NUFJFU1MgfSA9IGVudlxyXG4gICAgY29uc3QgcGx1Z2luID0gW11cclxuICAgIGlmIChWSVRFX0JVSUxEX0NPTVBSRVNTKSB7XHJcbiAgICAgICAgY29uc3QgY29tcHJlc3NMaXN0ID0gVklURV9CVUlMRF9DT01QUkVTUy5zcGxpdCgnLCcpXHJcbiAgICAgICAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcygnZ3ppcCcpKSB7XHJcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9kb2MucnVveWkudmlwL3J1b3lpLXZ1ZS9vdGhlci9mYXEuaHRtbCNcdTRGN0ZcdTc1MjhnemlwXHU4OUUzXHU1MzhCXHU3RjI5XHU5NzU5XHU2MDAxXHU2NTg3XHU0RUY2XHJcbiAgICAgICAgICAgIHBsdWdpbi5wdXNoKFxyXG4gICAgICAgICAgICAgICAgY29tcHJlc3Npb24oe1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dDogJy5neicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3JpZ2luRmlsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcygnYnJvdGxpJykpIHtcclxuICAgICAgICAgICAgcGx1Z2luLnB1c2goXHJcbiAgICAgICAgICAgICAgICBjb21wcmVzc2lvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0OiAnLmJyJyxcclxuICAgICAgICAgICAgICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3JpZ2luRmlsZTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGx1Z2luXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxqYXZhXFxcXHByb2plY3RcXFxcUnVvWWktVnVlM1xcXFx2aXRlXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1xcXFxzZXR1cC1leHRlbmQuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L2phdmEvcHJvamVjdC9SdW9ZaS1WdWUzL3ZpdGUvcGx1Z2lucy9zZXR1cC1leHRlbmQuanNcIjtpbXBvcnQgc2V0dXBFeHRlbmQgZnJvbSAndW5wbHVnaW4tdnVlLXNldHVwLWV4dGVuZC1wbHVzL3ZpdGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTZXR1cEV4dGVuZCgpIHtcclxuICAgIHJldHVybiBzZXR1cEV4dGVuZCh7fSlcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXGphdmFcXFxccHJvamVjdFxcXFxSdW9ZaS1WdWUzXFxcXHZpdGVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcamF2YVxcXFxwcm9qZWN0XFxcXFJ1b1lpLVZ1ZTNcXFxcdml0ZVxcXFxwbHVnaW5zXFxcXHZpdGUtcGx1Z2luLXB3YS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovamF2YS9wcm9qZWN0L1J1b1lpLVZ1ZTMvdml0ZS9wbHVnaW5zL3ZpdGUtcGx1Z2luLXB3YS5qc1wiO2ltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVQd2EoKSB7XHJcbiAgcmV0dXJuIFZpdGVQV0Eoe1xyXG4gICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ21hc2tlZC1pY29uLnN2ZyddLFxyXG4gICAgbWFuaWZlc3Q6IHtcclxuICAgICAgbmFtZTogJ09LXHU0RTkxIEVSUFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERicsXHJcbiAgICAgIHNob3J0X25hbWU6ICdPS1x1NEU5MScsXHJcbiAgICAgIHN0YXJ0X3VybDogJy9pbmRleC5odG1sJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdcdTRFMDBcdTdBRDlcdTVGMEYgXHU4RkRCXHU5NTAwXHU1QjU4XHU3QkExXHU3NDA2XHU3Q0ZCXHU3Q0ZCXHU3RURGICcsXHJcbiAgICAgIHRoZW1lX2NvbG9yOiAnIzVjNmFjNCcsXHJcbiAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgaWNvbnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6ICdpY29ucy9wd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6ICdpY29ucy9wd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBzY3JlZW5zaG90czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNyYzogJ3NjcmVlbnNob3RzL3NjcmVlbnNob3QtODAweDYwMC5wbmcnLFxyXG4gICAgICAgICAgc2l6ZXM6ICc4MDB4NjAwJyxcclxuICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgZm9ybV9mYWN0b3I6IFwid2lkZVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzcmM6ICdzY3JlZW5zaG90cy9zY3JlZW5zaG90LTMyMHgzMjAucG5nJyxcclxuICAgICAgICAgIHNpemVzOiAnMzIweDMyMCcsXHJcbiAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIGZvcm1fZmFjdG9yOiBcIm5hcnJvd1wiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgd29ya2JveDoge1xyXG4gICAgICAvLyBcdTZFMDVcdTk2NjRcdThGQzdcdTY3MUZcdTc2ODRcdTdGMTNcdTVCNThcclxuICAgICAgY2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxyXG4gICAgICAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTRFMEJcdTY3ODRcdTVFRkEgc3cuanNcclxuICAgICAgc291cmNlbWFwOiB0cnVlLCAvLyBcdTc5ODFcdTc1MjhcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTc2ODQgU291cmNlIE1hcHNcclxuICAgICAgLy8gXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3RjEzXHU1QjU4XHJcbiAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2ZyxqcGcsanBlZyxqc29ufSddLFxyXG4gICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTdGMTNcdTVCNThcdTdCNTZcdTc1NjVcdTdCNDlcclxuICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB1cmxQYXR0ZXJuOiAvXFwvZGV2LWFwaVxcL2ZpbmFuY2VcXC8uKi9pLFxyXG4gICAgICAgICAgaGFuZGxlcjogJ1N0YWxlV2hpbGVSZXZhbGlkYXRlJyxcclxuICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY2FjaGVOYW1lOiAnZmluYW5jZS1kYXRhLXYxJyxcclxuICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxyXG4gICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDcgLy8gNyBkYXlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHVybFBhdHRlcm46IC9cXC9kZXYtYXBpXFwvcHJvZHVjdFxcLy4qL2ksXHJcbiAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcclxuICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY2FjaGVOYW1lOiAncHJvZHVjdC1kYXRhLXYxJyxcclxuICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxyXG4gICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDcgLy8gNyBkYXlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHVybFBhdHRlcm46IC8uKlxcLig/OmpzfGNzc3xodG1sfHBuZ3xzdmd8d29mZjI/KSQvLFxyXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxyXG4gICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBjYWNoZU5hbWU6ICdzdGF0aWMtYXNzZXRzLXYxJyxcclxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcclxuICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCwgLy8gMzAgZGF5c1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICAgIC8vIFx1NUYwMFx1NTNEMVx1NzNBRlx1NTg4M1x1NUYwMFx1NTQyRlxyXG4gICAgZGV2T3B0aW9uczoge1xyXG4gICAgICBlbmFibGVkOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICB9KVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF3USxTQUFTLGNBQWMsZUFBZTtBQUM5UyxPQUFPQSxXQUFVOzs7QUNEc1IsT0FBTyxTQUFTOzs7QUNBSixPQUFPLGdCQUFnQjtBQUUzVCxTQUFSLG1CQUFvQztBQUN2QyxTQUFPLFdBQVc7QUFBQSxJQUNkLFNBQVM7QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsSUFDQSxLQUFLO0FBQUEsRUFDVCxDQUFDO0FBQ0w7OztBQ1g2UyxTQUFTLDRCQUE0QjtBQUNsVixPQUFPLFVBQVU7QUFFRixTQUFSLGNBQStCLFNBQVM7QUFDM0MsU0FBTyxxQkFBcUI7QUFBQSxJQUM5QixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0FBQUEsSUFDeEQsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLEVBQ2pCLENBQUM7QUFDTDs7O0FDVG1ULE9BQU8saUJBQWlCO0FBRTVULFNBQVIsa0JBQW1DLEtBQUs7QUFDM0MsUUFBTSxFQUFFLG9CQUFvQixJQUFJO0FBQ2hDLFFBQU0sU0FBUyxDQUFDO0FBQ2hCLE1BQUkscUJBQXFCO0FBQ3JCLFVBQU0sZUFBZSxvQkFBb0IsTUFBTSxHQUFHO0FBQ2xELFFBQUks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
