<template>
  <section class="bg-faq">
    <div class="bg-faq-inner">
      <header class="bg-faq-header">
        <span class="bg-faq-eyebrow">{{ t('faq.eyebrow') }}</span>
        <h2 class="bg-faq-title">{{ t('faq.title') }}</h2>
        <p class="bg-faq-subtitle">{{ t('faq.subtitle') }}</p>
      </header>

      <div class="bg-faq-list">
        <AnimatedContent
          v-for="(item, i) in items"
          :key="i"
          direction="vertical"
          :distance="40"
          :delay="i * 0.08"
          :duration="0.6"
        >
          <details class="bg-faq-item" :open="i === 0">
            <summary class="bg-faq-q">
              <span>{{ item.q }}</span>
              <span class="bg-faq-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
            </summary>
            <p class="bg-faq-a">{{ item.a }}</p>
          </details>
        </AnimatedContent>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AnimatedContent from '@/content/Animations/AnimatedContent/AnimatedContent.vue';
import { useLocale } from '@/composables/useLocale';
import './FAQ.css';

const { t } = useLocale();
const { tm } = useI18n();

const items = computed(() => (tm('faq.items') as unknown as Array<{ q: string; a: string }>) || []);
</script>
