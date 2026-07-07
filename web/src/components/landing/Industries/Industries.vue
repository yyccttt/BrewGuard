<template>
  <section class="bg-ind">
    <div class="bg-ind-inner">
      <header class="bg-ind-header">
        <span class="bg-ind-eyebrow">{{ t('industries.eyebrow') }}</span>
        <h2 class="bg-ind-title">
          <BlurText :text="t('industries.title')" :delay="150" animateBy="words" />
        </h2>
        <p class="bg-ind-subtitle">{{ t('industries.subtitle') }}</p>
      </header>

      <div class="bg-ind-grid">
        <SpotlightCard
          v-for="(key, i) in keys"
          :key="key"
          class="bg-ind-card"
          spotlight-color="rgba(124, 255, 103, 0.18)"
        >
          <div class="bg-ind-icon" v-html="icons[key]" />
          <h3 class="bg-ind-name">{{ t(`industries.items.${key}.title`) }}</h3>
          <p class="bg-ind-desc">{{ t(`industries.items.${key}.desc`) }}</p>
        </SpotlightCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SpotlightCard from '@/content/Components/SpotlightCard/SpotlightCard.vue';
import BlurText from '@/content/TextAnimations/BlurText/BlurText.vue';
import { useLocale } from '@/composables/useLocale';
import './Industries.css';

const { t } = useLocale();
const keys = ['beer', 'wine', 'spirit', 'lab'] as const;

const icons: Record<string, string> = {
  beer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v3M12 4v3M16 4v3M7 7h10v9a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V7zM7 11h10"/></svg>`,
  wine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 6a3 3 0 0 1-6 0L8 3zM12 12v6M9 21h6M10 18h4"/></svg>`,
  spirit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v5l-2 3v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8l-2-3V3M8 13h8"/></svg>`,
  lab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v6l-4 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-4-8V3M8 3h8M8 14h8"/></svg>`
};
</script>
