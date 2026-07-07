<template>
  <section class="bg-data">
    <div class="bg-data-waves" aria-hidden="true">
      <Waves lineColor="rgba(124,255,103,0.18)" backgroundColor="transparent" :waveAmpX="28" :waveAmpY="14" :xGap="14" :yGap="40" />
    </div>
    <div class="bg-data-inner">
      <header class="bg-data-header">
        <span class="bg-data-eyebrow">
          <span class="bg-data-live-dot" />{{ t('dataPreview.eyebrow') }}
        </span>
        <h2 class="bg-data-title">{{ t('dataPreview.title') }}</h2>
        <p class="bg-data-subtitle">{{ t('dataPreview.subtitle') }}</p>
      </header>

      <div class="bg-data-chart-card">
        <div class="bg-data-chart-head">
          <div class="bg-data-legend">
            <span class="bg-data-legend-item"><i class="bg-data-dot bg-data-dot--temp" />{{ t('dataPreview.tempLabel') }}</span>
            <span class="bg-data-legend-item"><i class="bg-data-dot bg-data-dot--ph" />{{ t('dataPreview.phLabel') }}</span>
          </div>
          <span class="bg-data-live-tag">{{ t('dataPreview.liveTag') }}</span>
        </div>

        <svg class="bg-data-chart" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7cff67" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#7cff67" stop-opacity="0" />
            </linearGradient>
          </defs>

          <g class="bg-data-grid">
            <line v-for="y in [0, 70, 140, 210, 280]" :key="y" :x1="0" :x2="800" :y1="y" :y2="y" />
          </g>

          <path :d="tempAreaPath" fill="url(#tempFill)" />
          <path :d="tempPath" class="bg-data-line bg-data-line--temp" />
          <path :d="phPath" class="bg-data-line bg-data-line--ph" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import Waves from '@/content/Backgrounds/Waves/Waves.vue';
import { useLocale } from '@/composables/useLocale';
import './DataPreview.css';

const { t } = useLocale();

const POINTS = 32;
const WIDTH = 800;
const HEIGHT = 280;

const offset = ref(0);
let raf = 0;

function buildPath(values: number[], min: number, max: number): string {
  const range = max - min || 1;
  const step = WIDTH / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = HEIGHT - ((v - min) / range) * (HEIGHT - 40) - 20;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const tempData = ref<number[]>([]);
const phData = ref<number[]>([]);

function genTemp(i: number): number {
  return 22 + Math.sin((i + offset.value) * 0.35) * 3 + Math.sin((i + offset.value) * 0.9) * 1.2;
}
function genPh(i: number): number {
  return 4.2 + Math.sin((i + offset.value) * 0.25 + 1) * 0.4 + Math.cos((i + offset.value) * 0.7) * 0.15;
}

function tick() {
  offset.value += 0.06;
  tempData.value = Array.from({ length: POINTS }, (_, i) => genTemp(i));
  phData.value = Array.from({ length: POINTS }, (_, i) => genPh(i));
  raf = requestAnimationFrame(tick);
}

const tempPath = computed(() => buildPath(tempData.value, 16, 30));
const tempAreaPath = computed(() => `${tempPath.value} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`);
const phPath = computed(() => buildPath(phData.value, 3, 6));

function start() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    offset.value = 5;
    tempData.value = Array.from({ length: POINTS }, (_, i) => genTemp(i));
    phData.value = Array.from({ length: POINTS }, (_, i) => genPh(i));
    return;
  }
  tick();
}

start();
onUnmounted(() => cancelAnimationFrame(raf));
</script>
