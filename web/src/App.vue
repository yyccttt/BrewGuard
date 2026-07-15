<template>
  <router-view />
  <AiAssistant />
  <CommandPalette ref="cmdPaletteRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AiAssistant from '@/components/common/AiAssistant.vue';
import CommandPalette from '@/components/common/CommandPalette.vue';

const cmdPaletteRef = ref<InstanceType<typeof CommandPalette> | null>(null);

// 全局快捷键:Ctrl+K 或 `/` 唤起命令面板(输入框内按 / 不触发)
function onGlobalKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    cmdPaletteRef.value?.open();
    return;
  }
  if (e.key === '/' && !inInput) {
    e.preventDefault();
    cmdPaletteRef.value?.open();
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown));
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown));
</script>
