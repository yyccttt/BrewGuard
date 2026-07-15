<template>
  <div class="sys-page">
    <h1 class="sys-title">{{ t('admin.system.title') }}</h1>

    <div class="sys-tabs">
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        <i class="pi pi-users" />
        {{ t('admin.system.tabUsers') }}
      </button>
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'audit' }"
        @click="activeTab = 'audit'"
      >
        <i class="pi pi-history" />
        {{ t('admin.system.tabAuditLog') }}
      </button>
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'roles' }"
        @click="activeTab = 'roles'"
      >
        <i class="pi pi-shield" />
        {{ t('admin.system.tabRoles') }}
      </button>
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'menus' }"
        @click="activeTab = 'menus'"
      >
        <i class="pi pi-bars" />
        {{ t('admin.system.tabMenus') }}
      </button>
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'depts' }"
        @click="activeTab = 'depts'"
      >
        <i class="pi pi-sitemap" />
        {{ t('admin.system.tabDepts') }}
      </button>
      <button
        class="sys-tab"
        :class="{ 'is-active': activeTab === 'apis' }"
        @click="activeTab = 'apis'"
      >
        <i class="pi pi-bolt" />
        {{ t('admin.system.tabApis') }}
      </button>
    </div>

    <Users v-if="activeTab === 'users'" />
    <AuditLog v-else-if="activeTab === 'audit'" />
    <Roles v-else-if="activeTab === 'roles'" />
    <Menus v-else-if="activeTab === 'menus'" />
    <Depts v-else-if="activeTab === 'depts'" />
    <Apis v-else-if="activeTab === 'apis'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Users from './system/Users.vue';
import AuditLog from './system/AuditLog.vue';
import Roles from './system/Roles.vue';
import Menus from './system/Menus.vue';
import Depts from './system/Depts.vue';
import Apis from './system/Apis.vue';
import './system/SystemPages.css';

const { t } = useI18n();
const activeTab = ref<string>('users');
</script>

<style scoped>
.sys-page {
  max-width: 1200px;
  margin: 0 auto;
}

.sys-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: #fff;
}

.sys-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sys-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-family: 'Geist', sans-serif;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: -1px;
}

.sys-tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.sys-tab.is-active {
  color: var(--color-primary, #7cff67);
  border-bottom-color: var(--color-primary, #7cff67);
}
</style>
