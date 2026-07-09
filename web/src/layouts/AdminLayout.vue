<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-logo">
        <img :src="logo" alt="BrewGuard" />
      </div>
      <nav class="admin-sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="admin-menu-item"
          active-class="is-active"
        >
          <i :class="item.icon" />
          <span>{{ t(item.label) }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="admin-header-title">{{ t('admin.brand') }}</div>
        <div class="admin-header-actions">
          <ThemeToggle />
          <LangToggle />
          <a class="admin-back-home" href="/">{{ t('admin.backHome') }}</a>
        </div>
      </header>

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import logo from '@/assets/logos/brewguard-logo.svg';
import LangToggle from '@/components/common/LangToggle.vue';
import ThemeToggle from '@/components/common/ThemeToggle.vue';
import './AdminLayout.css';

const { t } = useI18n();

const menuItems = [
  { path: '/admin/dashboard', label: 'admin.menu.dashboard', icon: 'pi pi-chart-line' },
  { path: '/admin/batch', label: 'admin.menu.batch', icon: 'pi pi-tags' },
  { path: '/admin/alerts', label: 'admin.menu.alerts', icon: 'pi pi-bell' },
  { path: '/admin/system', label: 'admin.menu.system', icon: 'pi pi-cog' }
];
</script>
