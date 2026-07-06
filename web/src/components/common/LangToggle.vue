<template>
  <button class="lang-toggle" :aria-label="`Switch to ${t('langToggle.switchTo')}`" @click="toggle">
    <svg class="lang-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 8h14M9 4v4M11 14h4M13 14c-2 4-5 6-9 6M14 16c0 4 3 6 6 6" />
    </svg>
    <span class="lang-toggle-label">{{ t('langToggle.switchTo') }}</span>
  </button>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

const { t, toggle } = useLocale();
</script>

<style scoped>
.lang-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(18, 15, 23, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(32px) saturate(1.3);
  -webkit-backdrop-filter: blur(32px) saturate(1.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.lang-toggle:hover {
  background: rgba(18, 15, 23, 0.6);
  border-color: rgba(124, 255, 103, 0.35);
  color: #fff;
}

.lang-toggle-icon {
  width: 16px;
  height: 16px;
}

.lang-toggle-label {
  line-height: 1;
}

@media (max-width: 480px) {
  .lang-toggle {
    top: 14px;
    right: 14px;
    padding: 7px 12px;
    font-size: 12px;
  }
}
</style>
