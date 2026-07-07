<template>
  <section class="bg-marquee" aria-hidden="true">
    <div class="bg-marquee-track">
      <span v-for="(item, i) in loopItems" :key="i" class="bg-marquee-item">
        {{ item }}<span class="bg-marquee-dot">·</span>
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import './Marquee.css';

const { tm } = useI18n();

const rawItems = computed(() => {
  const items = tm('marquee.items') as unknown as string[];
  return Array.isArray(items) ? items : [];
});

// 复制两份保证无缝循环
const loopItems = computed(() => [...rawItems.value, ...rawItems.value]);
</script>
