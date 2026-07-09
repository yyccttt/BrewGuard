<template>
  <div class="theme-toggle">
    <Button
      :icon="iconFor(theme.mode)"
      severity="secondary"
      text
      rounded
      size="small"
      v-tooltip.top="labelFor(theme.mode)"
      @click="cycle"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';

const { t } = useI18n();

const theme = useThemeStore();

// 图标:dark=月亮,light=太阳,auto=自动
function iconFor(mode: ThemeMode): string {
  if (mode === 'light') return 'pi pi-sun';
  if (mode === 'dark') return 'pi pi-moon';
  return 'pi pi-bolt';
}

function labelFor(mode: ThemeMode): string {
  if (mode === 'light') return t('admin.theme.light');
  if (mode === 'dark') return t('admin.theme.dark');
  return t('admin.theme.auto');
}

// 循环切换:dark -> light -> auto -> dark
function cycle() {
  const order: ThemeMode[] = ['dark', 'light', 'auto'];
  const idx = order.indexOf(theme.mode);
  theme.setMode(order[(idx + 1) % order.length]);
}
</script>
