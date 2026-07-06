<template>
  <section class="bg-features" id="features">
    <div class="bg-features-inner" :class="{ 'is-visible': visible }" ref="innerEl">
      <header class="bg-features-header">
        <span class="bg-features-eyebrow">{{ t('features.eyebrow') }}</span>
        <h2 class="bg-features-title">{{ t('features.title') }}</h2>
        <p class="bg-features-subtitle">{{ t('features.subtitle') }}</p>
      </header>

      <div class="bg-features-grid">
        <article v-for="f in featureKeys" :key="f.key" class="bg-feature-card">
          <div class="bg-feature-icon" v-html="f.icon" />
          <h3 class="bg-feature-name">{{ t(`features.items.${f.key}.title`) }}</h3>
          <p class="bg-feature-desc">{{ t(`features.items.${f.key}.desc`) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useLocale } from '@/composables/useLocale';
import './BrewingFeatures.css';

const { t } = useLocale();

const innerEl = ref<HTMLDivElement | null>(null);
const visible = ref(false);
let io: IntersectionObserver | null = null;

const featureKeys = [
  {
    key: 'realtime',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>`
  },
  {
    key: 'visualization',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V9M15 17v-4M21 17H3"/></svg>`
  },
  {
    key: 'alerts',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></svg>`
  },
  {
    key: 'traceability',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>`
  }
];

onMounted(() => {
  if (!innerEl.value) return;
  io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true;
          io?.disconnect();
        }
      }
    },
    { threshold: 0.1, rootMargin: '-60px' }
  );
  io.observe(innerEl.value);
});

onBeforeUnmount(() => io?.disconnect());
</script>
