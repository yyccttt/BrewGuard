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
    </div>

    <Users v-if="activeTab === 'users'" />
    <AuditLog v-else-if="activeTab === 'audit'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Users from './system/Users.vue';
import AuditLog from './system/AuditLog.vue';
import './system/SystemPages.css';

const { t } = useI18n();
const activeTab = ref<'users' | 'audit'>('users');
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
