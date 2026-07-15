<template>
  <Dialog v-model:visible="visible" modal :showHeader="false" :closable="false" class="cmd-palette-dialog">
    <div class="cmd-palette">
      <div class="cmd-input-wrap">
        <i class="pi pi-search cmd-input-icon" />
        <input ref="inputRef" v-model="keyword" class="cmd-input" :placeholder="t('common.commandPalette.placeholder')" @keydown="onKeydown" />
        <kbd class="cmd-kbd">ESC</kbd>
      </div>

      <div class="cmd-results" ref="resultsRef">
        <div v-if="filtered.length === 0" class="cmd-empty">{{ t('common.commandPalette.empty') }}</div>
        <div v-for="(item, i) in filtered" :key="item.id" class="cmd-item" :class="{ 'is-active': i === activeIndex }" @click="selectItem(item)" @mouseenter="activeIndex = i">
          <i :class="item.icon || 'pi pi-link'" class="cmd-item-icon" />
          <div class="cmd-item-body">
            <div class="cmd-item-label">{{ item.label }}</div>
            <div class="cmd-item-desc">{{ item.desc }}</div>
          </div>
          <span class="cmd-item-type">{{ item.typeLabel }}</span>
        </div>
      </div>

      <div class="cmd-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> {{ t('common.commandPalette.navigate') }}</span>
        <span><kbd>↵</kbd> {{ t('common.commandPalette.select') }}</span>
        <span><kbd>esc</kbd> {{ t('common.commandPalette.close') }}</span>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDebounceFn } from '@vueuse/core';
import Dialog from 'primevue/dialog';
import { get } from '@/utils/http';

const router = useRouter();
const { t } = useI18n();

interface CmdItem { id: string; label: string; desc: string; icon?: string; path: string; typeLabel: string }

const visible = ref(false);
const keyword = ref('');
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const resultsRef = ref<HTMLElement | null>(null);
const batchResults = ref<CmdItem[]>([]);

const menuItems = computed<CmdItem[]>(() => [
  { id: 'm-dashboard', label: t('admin.menu.dashboard'), desc: '/admin/dashboard', icon: 'pi pi-chart-line', path: '/admin/dashboard', typeLabel: t('common.commandPalette.typeMenu') },
  { id: 'm-batch', label: t('admin.menu.batch'), desc: '/admin/batch', icon: 'pi pi-tags', path: '/admin/batch', typeLabel: t('common.commandPalette.typeMenu') },
  { id: 'm-alerts', label: t('admin.menu.alerts'), desc: '/admin/alerts', icon: 'pi pi-bell', path: '/admin/alerts', typeLabel: t('common.commandPalette.typeMenu') },
  { id: 'm-system', label: t('admin.menu.system'), desc: '/admin/system', icon: 'pi pi-cog', path: '/admin/system', typeLabel: t('common.commandPalette.typeMenu') },
]);

const filtered = computed<CmdItem[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  const all = [...menuItems.value, ...batchResults.value];
  if (!kw) return all.slice(0, 12);
  return all.filter((it) => it.label.toLowerCase().includes(kw) || it.desc.toLowerCase().includes(kw)).slice(0, 20);
});

const searchBatches = useDebounceFn(async (kw: string) => {
  if (!kw || kw.length < 1) { batchResults.value = []; return; }
  try {
    const res = await get<any>('/batch/list', { page: 1, page_size: 10, batch_no: kw });
    batchResults.value = (res.data || []).map((b: any) => ({
      id: `b-${b.id}`,
      label: `${b.batch_no}${b.recipe ? ' · ' + b.recipe : ''}`,
      desc: t('common.commandPalette.batchDesc'),
      icon: 'pi pi-tag',
      path: `/admin/batch/${b.id}`,
      typeLabel: t('common.commandPalette.typeBatch'),
    }));
  } catch { batchResults.value = []; }
}, 300);

watch(keyword, (kw) => { activeIndex.value = 0; searchBatches(kw); });

watch(visible, async (v) => {
  if (v) { keyword.value = ''; activeIndex.value = 0; await nextTick(); inputRef.value?.focus(); }
});

function open() { visible.value = true; }
function selectItem(item: CmdItem) { visible.value = false; router.push(item.path); }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1); scrollIntoView(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex.value = Math.max(activeIndex.value - 1, 0); scrollIntoView(); }
  else if (e.key === 'Enter') { e.preventDefault(); const item = filtered.value[activeIndex.value]; if (item) selectItem(item); }
}

function scrollIntoView() {
  nextTick(() => {
    const el = resultsRef.value?.querySelector('.is-active') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  });
}

defineExpose({ open, visible });
</script>

<style scoped>
.cmd-palette-dialog :deep(.p-dialog) { width: 560px; max-width: 92vw; border-radius: 14px; overflow: hidden; background: #141414; border: 1px solid rgba(255,255,255,0.08); }
.cmd-palette { display: flex; flex-direction: column; }
.cmd-input-wrap { display: flex; align-items: center; gap: 0.7rem; padding: 0.9rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cmd-input-icon { color: rgba(255,255,255,0.4); }
.cmd-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 0.95rem; font-family: 'Geist', sans-serif; }
.cmd-input::placeholder { color: rgba(255,255,255,0.3); }
.cmd-kbd { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
.cmd-results { max-height: 360px; overflow-y: auto; padding: 0.4rem; }
.cmd-empty { text-align: center; padding: 2.5rem 1rem; color: rgba(255,255,255,0.35); font-size: 0.88rem; }
.cmd-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.7rem; border-radius: 8px; cursor: pointer; transition: background 0.12s ease; }
.cmd-item.is-active { background: rgba(124,255,103,0.1); }
.cmd-item-icon { color: rgba(255,255,255,0.5); font-size: 0.9rem; }
.cmd-item.is-active .cmd-item-icon { color: var(--color-primary, #7cff67); }
.cmd-item-body { flex: 1; min-width: 0; }
.cmd-item-label { color: rgba(255,255,255,0.9); font-size: 0.88rem; }
.cmd-item-desc { color: rgba(255,255,255,0.35); font-size: 0.75rem; margin-top: 2px; }
.cmd-item-type { font-size: 0.68rem; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); }
.cmd-footer { display: flex; gap: 1.2rem; padding: 0.6rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.72rem; color: rgba(255,255,255,0.4); }
.cmd-footer kbd { background: rgba(255,255,255,0.08); border-radius: 3px; padding: 1px 5px; margin-right: 3px; font-family: 'Geist Mono', monospace; }
</style>
