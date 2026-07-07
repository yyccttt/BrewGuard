<template>
  <section class="bg-features" id="features">
    <div class="bg-features-inner">
      <header class="bg-features-header">
        <AnimatedContent direction="vertical" :distance="40" :duration="0.7">
          <span class="bg-features-eyebrow">{{ t('features.eyebrow') }}</span>
          <h2 class="bg-features-title">
            <BlurText :text="t('features.title')" :delay="150" animateBy="words" />
          </h2>
          <p class="bg-features-subtitle">{{ t('features.subtitle') }}</p>
        </AnimatedContent>
      </header>

      <div class="bg-features-grid">
        <AnimatedContent
          v-for="(f, i) in featureKeys"
          :key="f.key"
          direction="vertical"
          :distance="60"
          :delay="i * 0.12"
          :duration="0.7"
        >
          <BorderGlow
            class="bg-feature-card"
            backgroundColor="rgba(255,255,255,0.03)"
            glowColor="140 100 73"
            :borderRadius="20"
            :glowRadius="30"
            :glowIntensity="0.8"
            :colors="['#7cff67', '#3da86a', '#0b0b0b']"
            :fillOpacity="0.15"
          >
            <div class="bg-feature-icon" v-html="f.icon" />
            <h3 class="bg-feature-name">{{ t(`features.items.${f.key}.title`) }}</h3>
            <p class="bg-feature-desc">{{ t(`features.items.${f.key}.desc`) }}</p>
          </BorderGlow>
        </AnimatedContent>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AnimatedContent from '@/content/Animations/AnimatedContent/AnimatedContent.vue';
import BorderGlow from '@/content/Components/BorderGlow/BorderGlow.vue';
import BlurText from '@/content/TextAnimations/BlurText/BlurText.vue';
import { useLocale } from '@/composables/useLocale';
import './BrewingFeatures.css';

const { t } = useLocale();

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
</script>
