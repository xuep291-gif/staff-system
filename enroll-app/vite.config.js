import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'fs'
import path from 'path'

// Fix for uni-ui duplicate variable declaration bug in H5 builds
function uniUiFixPlugin() {
  return {
    name: 'uni-ui-fix',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('uni-popup.vue')) {
        // Replace duplicate destructuring with a single version
        // The issue: both #ifdef MP-WEIXIN and #ifndef MP-WEIXIN blocks are included in H5
        const fixedCode = code.replace(
          /\/\/ #ifdef MP-WEIXIN\s+const \{[^}]+\} = uni\.getWindowInfo\(\)\s+\/\/ #endif\s+\/\/ #ifndef MP-WEIXIN\s+const \{([^}]+)\} = uni\.getSystemInfoSync\(\)\s+\/\/ #endif/g,
          (match, vars) => {
            return `const {${vars}} = uni.getSystemInfoSync()`
          }
        )
        if (fixedCode !== code) {
          return { code: fixedCode, map: null }
        }
      }
      if (id.includes('uni-th.vue')) {
        // Fix duplicate widthCoe declaration
        const fixedCode = code.replace(
          /let widthCoe = uni\.getSystemInfoSync\(\)\.screenWidth \/ 750\s+}\s+else\s+{\s+let widthCoe = uni\.getWindowInfo\(\)\.screenWidth \/ 750/g,
          'let widthCoe\nif (true) { widthCoe = uni.getSystemInfoSync().screenWidth / 750 } else { widthCoe = uni.getWindowInfo().screenWidth / 750'
        )
        if (fixedCode !== code) {
          return { code: fixedCode, map: null }
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uniUiFixPlugin(),
    uni({
      vueOptions: {
        reactivityTransform: true,
        template: {
          compilerOptions: {
            // 将 uni- 和 van- 前缀的标签视为自定义元素
            isCustomElement: (tag) => tag.startsWith('van-')
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/common': fileURLToPath(new URL('./src/common', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@/static': fileURLToPath(new URL('./static', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      // 添加指向项目根目录 common 文件夹的别名
      '/@/common': fileURLToPath(new URL('./common', import.meta.url)),
      'vuex': 'vuex/dist/vuex.esm-bundler.js',
      'side-channel': path.resolve(__dirname, 'src/side-channel.js')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://house.cloud.smallsaas.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/form': {
        target: 'https://static.smallsaas.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 删除所有可能的 CORS 头（包括大小写变体）
            const headersToRemove = [
              'access-control-allow-origin',
              'Access-Control-Allow-Origin',
              'access-control-allow-methods',
              'Access-Control-Allow-Methods',
              'access-control-allow-credentials',
              'Access-Control-Allow-Credentials',
              'access-control-max-age',
              'Access-Control-Max-Age'
            ]
            headersToRemove.forEach(header => {
              delete proxyRes.headers[header]
              delete proxyRes.headers[header.toLowerCase()]
            })
          })
        }
      },
      '/data': {
        target: 'https://static.smallsaas.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const headersToRemove = [
              'access-control-allow-origin',
              'Access-Control-Allow-Origin',
              'access-control-allow-methods',
              'Access-Control-Allow-Methods',
              'access-control-allow-credentials',
              'Access-Control-Allow-Credentials',
              'access-control-max-age',
              'Access-Control-Max-Age'
            ]
            headersToRemove.forEach(header => {
              delete proxyRes.headers[header]
              delete proxyRes.headers[header.toLowerCase()]
            })
          })
        }
      }
    }
  },
  build: {
    target: 'es2015',
    cssTarget: 'chrome61',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 分包优化
    rollupOptions: {
      output: {
        manualChunks: {
          'lodash': ['lodash']
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ''
      }
    }
  }
})
