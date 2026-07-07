<template>
  <section class="bg-stats">
    <div class="bg-stats-inner">
      <div v-for="key in keys" :key="key" class="bg-stat-item">
        <div class="bg-stat-value">
          <CountUp
            :to="items[key].value"
            :decimals="items[key].decimals"
            :duration="2"
            :separator="key === 'datapoints' ? ',' : ''"
          />
          <span class="bg-stat-suffix">{{ items[key].suffix }}</span>
        </div>
        <p class="bg-stat-label">{{ items[key].label }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CountUp from '@/content/TextAnimations/CountUp/CountUp.vue';
import { useI18n } from 'vue-i18n';
import './StatsBar.css';

const { t, tm } = useI18n();

const keys = ['accuracy', 'uptime', 'datapoints', 'clients'] as const;
const items = tm('stats.items') as unknown as Record<string, { value: number; suffix: string; decimals: number; label: string }>;
</script>
