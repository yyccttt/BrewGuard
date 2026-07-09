<template>
  <div class="tabbar">
    <div class="tabbar-scroll" ref="scrollRef">
      <div
        v-for="item in tabs"
        :key="item.id"
        class="tabbar-item"
        :class="{ 'is-active': item.id === activeId }"
        @click="onActivate(item)"
        @mouseup="onMiddleClick($event, item)"
        @contextmenu.prevent="onContextMenu($event, item)"
      >
        <i v-if="item.icon" :class="item.icon" class="tabbar-item-icon" />
        <span class="tabbar-item-label">{{ item.label }}</span>
        <i
          v-if="item.closable"
          class="pi pi-times tabbar-item-close"
          @click.stop="onClose(item)"
        />
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="ctxMenu.visible"
      class="tabbar-ctxmenu"
      :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }"
      @click.stop
    >
      <div class="tabbar-ctxmenu-item" @click="ctxAction('current')">{{ t('admin.tab.closeCurrent') }}</div>
      <div class="tabbar-ctxmenu-item" @click="ctxAction('left')">{{ t('admin.tab.closeLeft') }}</div>
      <div class="tabbar-ctxmenu-item" @click="ctxAction('right')">{{ t('admin.tab.closeRight') }}</div>
      <div class="tabbar-ctxmenu-item" @click="ctxAction('others')">{{ t('admin.tab.closeOthers') }}</div>
      <div class="tabbar-ctxmenu-item" @click="ctxAction('all')">{{ t('admin.tab.closeAll') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import './TabBar.css';

const { t } = useI18n();
const router = useRouter();
const tabStore = useTabStore();
const { tabs, activeId } = storeToRefs(tabStore);

const scrollRef = ref<HTMLElement | null>(null);

// 右键菜单状态
const ctxMenu = reactive({ visible: false, x: 0, y: 0, targetId: '' });

function onActivate(item: TabItem) {
  tabStore.setActive(item.id);
  router.push(item.path);
}

function onClose(item: TabItem) {
  const target = tabStore.closeTab(item.id);
  if (target) router.push(target);
}

// 中键关闭
function onMiddleClick(e: MouseEvent, item: TabItem) {
  if (e.button === 1 && item.closable) {
    e.preventDefault();
    onClose(item);
  }
}

function onContextMenu(e: MouseEvent, item: TabItem) {
  ctxMenu.visible = true;
  ctxMenu.x = e.clientX;
  ctxMenu.y = e.clientY;
  ctxMenu.targetId = item.id;
}

function ctxAction(kind: 'current' | 'left' | 'right' | 'others' | 'all') {
  const id = ctxMenu.targetId;
  let target: string | null = null;
  if (kind === 'current') target = tabStore.closeTab(id);
  else if (kind === 'left') target = tabStore.closeLeft(id);
  else if (kind === 'right') target = tabStore.closeRight(id);
  else if (kind === 'others') target = tabStore.closeOthers(id);
  else if (kind === 'all') target = tabStore.closeAll();
  ctxMenu.visible = false;
  if (target) router.push(target);
}

// 点击页面其他位置关闭右键菜单
function hideCtxMenu() {
  ctxMenu.visible = false;
}

onMounted(() => document.addEventListener('click', hideCtxMenu));
onUnmounted(() => document.removeEventListener('click', hideCtxMenu));
</script>
