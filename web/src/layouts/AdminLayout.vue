<template>
  <div class="admin-layout">
    <aside id="admin-sidebar" :class="['admin-sidebar', sidebarOpen ? 'is-open' : '']">
      <div class="admin-sidebar-logo">
        <img :src="logo" alt="BrewGuard" />
        <button class="admin-sidebar-close" type="button" :aria-label="t('admin.closeMenu')" @click="closeSidebar">
          <i class="pi pi-times" aria-hidden="true" />
        </button>
      </div>
      <nav class="admin-sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="admin-menu-item"
          active-class="is-active"
          @click="closeSidebar"
        >
          <i :class="item.icon" />
          <span>{{ t(item.label) }}</span>
        </RouterLink>
      </nav>
    </aside>

    <button
      v-if="sidebarOpen"
      class="admin-sidebar-backdrop"
      type="button"
      :aria-label="t('admin.closeMenu')"
      @click="closeSidebar"
    />

    <div class="admin-main">
      <header class="admin-header">
        <div class="admin-header-leading">
          <button
            class="admin-menu-toggle"
            type="button"
            aria-controls="admin-sidebar"
            :aria-expanded="sidebarOpen"
            :aria-label="t('admin.openMenu')"
            @click="sidebarOpen = true"
          >
            <i class="pi pi-bars" aria-hidden="true" />
          </button>
          <div class="admin-header-title">{{ t('admin.brand') }}</div>
        </div>
        <div class="admin-header-actions">
          <NotificationBell />
          <ThemeToggle />
          <LangToggle />
          <a class="admin-back-home" href="/">{{ t('admin.backHome') }}</a>
        </div>
      </header>

      <TabBar />

      <main class="admin-content">
        <router-view v-slot="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import logo from '@/assets/logos/brewguard-logo.svg';
import LangToggle from '@/components/common/LangToggle.vue';
import ThemeToggle from '@/components/common/ThemeToggle.vue';
import NotificationBell from '@/components/common/NotificationBell.vue';
import TabBar from '@/components/admin/TabBar.vue';
import { useTabStore } from '@/stores/tabStore';
import './AdminLayout.css';

const { t } = useI18n();
const route = useRoute();
const tabStore = useTabStore();
const sidebarOpen = ref(false);

function closeSidebar() {
  sidebarOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeSidebar();
  }
}

const menuItems = [
  { path: '/admin/dashboard', label: 'admin.menu.dashboard', icon: 'pi pi-chart-line' },
  { path: '/admin/batch', label: 'admin.menu.batch', icon: 'pi pi-tags' },
  { path: '/admin/alerts', label: 'admin.menu.alerts', icon: 'pi pi-bell' },
  { path: '/admin/users', label: 'admin.menu.users', icon: 'pi pi-users' },
  { path: '/admin/auditlog', label: 'admin.menu.auditlog', icon: 'pi pi-list' },
  { path: '/admin/system', label: 'admin.menu.system', icon: 'pi pi-cog' }
];

// 路由变化时自动添加标签
watch(
  () => route,
  (r) => {
    tabStore.addTab(r, (key, fallback) => t(key) || fallback);
    closeSidebar();
  },
  { immediate: true, deep: true }
);

watch(sidebarOpen, (open) => {
  document.body.classList.toggle('admin-nav-open', open);
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.classList.remove('admin-nav-open');
});
</script>
