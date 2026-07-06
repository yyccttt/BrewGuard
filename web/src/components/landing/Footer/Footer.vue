<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import brewguardLogo from '../../../assets/logos/brewguard-logo.svg';
import { useLocale } from '@/composables/useLocale';
import './Footer.css';

const { t } = useLocale();
const year = new Date().getFullYear();

const innerEl = ref<HTMLDivElement | null>(null);
const visible = ref(false);

let io: IntersectionObserver | null = null;

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

<template>
  <footer class="ln-footer">
    <div class="ln-footer-glow" />
    <div class="ln-footer-separator" />

    <div ref="innerEl" class="ln-footer-inner" :class="{ 'is-visible': visible }">
      <div class="ln-footer-top">
        <div class="ln-footer-brand">
          <img :src="brewguardLogo" alt="BrewGuard" class="ln-footer-logo" />
          <p class="ln-footer-tagline">{{ t('footer.tagline') }}</p>
        </div>

        <nav class="ln-footer-nav">
          <div class="ln-footer-col">
            <span class="ln-footer-col-title">{{ t('footer.columns.product.title') }}</span>
            <span v-for="(item, i) in t('footer.columns.product.items')" :key="`p-${i}`" class="ln-footer-link">{{ item }}</span>
          </div>

          <div class="ln-footer-col">
            <span class="ln-footer-col-title">{{ t('footer.columns.solutions.title') }}</span>
            <span v-for="(item, i) in t('footer.columns.solutions.items')" :key="`s-${i}`" class="ln-footer-link">{{ item }}</span>
          </div>
        </nav>
      </div>

      <div class="ln-footer-bottom">
        <p class="ln-footer-attribution">{{ t('footer.attribution') }}</p>
        <p class="ln-footer-copy">{{ t('footer.rights', { year }) }}</p>
      </div>
    </div>
  </footer>
</template>
