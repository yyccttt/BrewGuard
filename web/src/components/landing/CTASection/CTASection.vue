<template>
  <section class="bg-cta">
    <div class="bg-cta-glow" aria-hidden="true" />
    <AnimatedContent direction="vertical" :distance="60" :duration="0.8" class="bg-cta-inner">
      <h2 class="bg-cta-title">{{ t('cta.title') }}</h2>
      <p class="bg-cta-subtitle">{{ t('cta.subtitle') }}</p>
      <div class="bg-cta-action">
        <StarBorder as="div" color="#7cff67" speed="5s" :thickness="1" custom-class="bg-cta-star">
          {{ t('cta.button') }}
        </StarBorder>
      </div>
    </AnimatedContent>
  </section>
</template>

<script setup lang="ts">
import AnimatedContent from '@/content/Animations/AnimatedContent/AnimatedContent.vue';
import StarBorder from '@/content/Animations/StarBorder/StarBorder.vue';
import { useLocale } from '@/composables/useLocale';
import './CTASection.css';

const { t } = useLocale();
</script>
