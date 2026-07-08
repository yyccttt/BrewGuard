<template>
  <div class="err-page">
    <div class="err-backdrop" />

    <div class="err-card">
      <!-- SVG 插画 -->
      <div class="err-illu">
        <!-- 403: 盾牌 + 锁 -->
        <svg v-if="code === 403" viewBox="0 0 200 200" fill="none">
          <circle class="err-ring" cx="100" cy="100" r="88" stroke="#ffb347" stroke-width="1.5" stroke-dasharray="4 6" />
          <path d="M100 40 L150 60 V105 C150 135 128 158 100 165 C72 158 50 135 50 105 V60 Z" fill="rgba(255,179,71,0.08)" stroke="#ffb347" stroke-width="2" />
          <rect x="86" y="92" width="28" height="24" rx="3" fill="#0a0a0a" stroke="#ffb347" stroke-width="2" />
          <path d="M92 92 V84 C92 78 96 74 100 74 C104 74 108 78 108 84 V92" stroke="#ffb347" stroke-width="2" fill="none" />
          <circle cx="100" cy="103" r="2.5" fill="#ffb347" />
        </svg>

        <!-- 404: 放大镜 + 问号 -->
        <svg v-else-if="code === 404" viewBox="0 0 200 200" fill="none">
          <circle class="err-ring" cx="100" cy="100" r="88" stroke="#7cff67" stroke-width="1.5" stroke-dasharray="4 6" />
          <circle cx="88" cy="88" r="42" fill="rgba(124,255,103,0.06)" stroke="#7cff67" stroke-width="2.5" />
          <line x1="120" y1="120" x2="150" y2="150" stroke="#7cff67" stroke-width="6" stroke-linecap="round" />
          <path d="M88 76 C82 76 78 80 78 86" stroke="#7cff67" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <circle cx="88" cy="96" r="2" fill="#7cff67" />
        </svg>

        <!-- 500: 齿轮 + 感叹号 -->
        <svg v-else viewBox="0 0 200 200" fill="none">
          <circle class="err-ring" cx="100" cy="100" r="88" stroke="#ff6b6b" stroke-width="1.5" stroke-dasharray="4 6" />
          <path d="M100 55 L107 70 L123 67 L128 82 L143 86 L137 100 L143 114 L128 118 L123 133 L107 130 L100 145 L93 130 L77 133 L72 118 L57 114 L63 100 L57 86 L72 82 L77 67 L93 70 Z" fill="rgba(255,107,107,0.08)" stroke="#ff6b6b" stroke-width="2" />
          <line x1="100" y1="85" x2="100" y2="105" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="100" cy="118" r="2.5" fill="#ff6b6b" />
        </svg>
      </div>

      <h1 :class="['err-code', `err-code-${code}`]">{{ code }}</h1>
      <h2 class="err-title">{{ t(`error.${code}.title`) }}</h2>
      <p class="err-desc">{{ t(`error.${code}.desc`) }}</p>

      <div class="err-actions">
        <button class="err-btn err-btn--primary" @click="goHome">
          <i class="pi pi-home" />
          {{ t('error.backHome') }}
        </button>
        <button class="err-btn err-btn--ghost" @click="goBack">
          <i class="pi pi-arrow-left" />
          {{ t('error.goBack') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import './error.css';

defineProps<{
  code: 403 | 404 | 500;
}>();

const { t } = useI18n();
const router = useRouter();

function goHome() {
  router.push('/');
}

function goBack() {
  // 有历史才回退,否则回首页,避免回退到错误页本身
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}
</script>
