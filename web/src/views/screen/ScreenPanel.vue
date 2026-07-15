<template>
  <div class="screen-panel">
    <div class="screen-panel-header">
      <span class="screen-panel-deco" />
      <span class="screen-panel-title">{{ title }}</span>
    </div>
    <div class="screen-panel-body"><slot /></div>
  </div>
</template>

<script setup lang="ts">
/** 大屏面板外壳组件(参考 sd-tourism-dashboard CPanel) */
defineProps<{ title: string }>();
</script>

<style scoped>
.screen-panel { position: relative; height: 100%; background: rgba(20,14,10,0.6); border: 1px solid rgba(255,180,80,0.15); border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; }
.screen-panel::before, .screen-panel::after { content: ''; position: absolute; width: 12px; height: 12px; border: 2px solid rgba(255,180,80,0.5); }
.screen-panel::before { top: 0; left: 0; border-right: none; border-bottom: none; }
.screen-panel::after { bottom: 0; right: 0; border-left: none; border-top: none; }
.screen-panel-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,180,80,0.12); background: linear-gradient(90deg, rgba(255,180,80,0.08), transparent); }
.screen-panel-deco { width: 4px; height: 14px; background: #ffb43b; border-radius: 2px; }
.screen-panel-title { color: #ffd89b; font-size: 15px; font-weight: 600; letter-spacing: 1px; }
.screen-panel-body { flex: 1; padding: 0.6rem; overflow: hidden; min-height: 0; }
</style>
