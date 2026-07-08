<template>
  <div class="admin-placeholder">
    <i class="pi pi-chart-line" />
    <h2>{{ t('admin.dashboard.title') }}</h2>
    <p>{{ t('admin.dashboard.comingSoon') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.admin-placeholder {
  text-align: center;
  padding: 5rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}
.admin-placeholder i {
  font-size: 3rem;
  color: #7cff67;
  margin-bottom: 1rem;
}
.admin-placeholder h2 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  color: #fff;
}
.admin-placeholder p {
  font-size: 0.95rem;
}
</style>
