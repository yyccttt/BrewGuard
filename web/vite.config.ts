import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import { templateCompilerOptions } from '@tresjs/core';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue({ ...templateCompilerOptions }),
    vueJsx(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': path.resolve(__dirname, 'src/content'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9999',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:9999',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
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
