<template>
  <section class="bg-how">
    <div class="bg-how-inner">
      <header class="bg-how-header">
        <span class="bg-how-eyebrow">{{ t('howItWorks.eyebrow') }}</span>
        <h2 class="bg-how-title">{{ t('howItWorks.title') }}</h2>
        <p class="bg-how-subtitle">{{ t('howItWorks.subtitle') }}</p>
      </header>

      <div class="bg-how-steps">
        <template v-for="(key, i) in keys" :key="key">
          <AnimatedContent direction="vertical" :distance="50" :delay="i * 0.12" :duration="0.7">
            <ElectricBorder color="#7cff67" :speed="1.2" :chaos="0.1" :borderRadius="20" class="bg-how-step-border">
              <div class="bg-how-step">
                <div class="bg-how-step-num">{{ String(i + 1).padStart(2, '0') }}</div>
                <h3 class="bg-how-step-title">{{ t(`howItWorks.steps.${key}.title`) }}</h3>
                <p class="bg-how-step-desc">{{ t(`howItWorks.steps.${key}.desc`) }}</p>
              </div>
            </ElectricBorder>
          </AnimatedContent>
          <div v-if="i < keys.length - 1" class="bg-how-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AnimatedContent from '@/content/Animations/AnimatedContent/AnimatedContent.vue';
import ElectricBorder from '@/content/Animations/ElectricBorder/ElectricBorder.vue';
import { useLocale } from '@/composables/useLocale';
import './HowItWorks.css';

const { t } = useLocale();
const keys = ['collect', 'analyze', 'alert', 'trace'] as const;
</script>
