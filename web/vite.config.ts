import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import { templateCompilerOptions } from '@tresjs/core';
import viteCompression from 'vite-plugin-compression';

import path from 'path';

export default defineConfig({
  plugins: [
    vue({ ...templateCompilerOptions }),
    vueJsx(),
    tailwindcss(),
    // gzip 预压缩(生产环境配合 nginx gzip_static)
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': path.resolve(__dirname, 'src/content'),
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    proxy: {
<<<<<<< HEAD
      '/api': {
        target: 'http://127.0.0.1:9999',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://127.0.0.1:9999',
        ws: true,
        changeOrigin: true
      }
=======
      '/api': { target: 'http://127.0.0.1:9999', changeOrigin: true },
      // WebSocket 代理(实时通信)
      '/ws': { target: 'ws://127.0.0.1:9999', ws: true, changeOrigin: true }
>>>>>>> origin/main
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // manualChunks:重依赖拆块,避免首屏一个大 chunk
        // 注意:primevue/primeicons 按需引入,不在此显式拆分(留待 vite 自动分块)
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          'animation-vendor': ['three', 'gsap', 'ogl', 'motion-v'],
          'chart-vendor': ['chart.js', 'vue-chartjs', 'echarts'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vue-i18n', 'axios'],
  },
});
