<template>
  <div class="alert-page">
    <div class="alert-toolbar">
      <h1 class="alert-title">{{ t('admin.alerts.title') }}</h1>
      <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" @change="loadList" class="alert-filter" />
    </div>

    <DataTable :value="alerts" :loading="loading" class="alert-table">
      <Column field="batch_id" :header="t('admin.alerts.batchId')" />
      <Column :header="t('admin.alerts.metric')">
        <template #body="{ data }">{{ t(`admin.alerts.metrics.${data.metric}`) }}</template>
      </Column>
      <Column field="value" :header="t('admin.alerts.value')" />
      <Column field="threshold" :header="t('admin.alerts.threshold')" />
      <Column :header="t('admin.alerts.direction')">
        <template #body="{ data }">
          <Tag :value="t(`admin.alerts.directions.${data.direction}`)" :severity="data.direction === 'high' ? 'danger' : 'warn'" />
        </template>
      </Column>
      <Column :header="t('admin.alerts.status')">
        <template #body="{ data }">
          <Tag :value="t(`admin.alerts.statuses.${data.status}`)" :severity="statusSeverity(data.status)" />
        </template>
      </Column>
      <Column field="created_at" :header="t('admin.alerts.time')" />
      <Column :header="t('admin.alerts.actions')" style="width: 160px">
        <template #body="{ data }">
          <Button v-if="data.status === 'open'" :label="t('admin.alerts.acknowledge')" icon="pi pi-check" text size="small" @click="doAcknowledge(data)" />
          <Button v-if="data.status !== 'resolved'" :label="t('admin.alerts.resolve')" icon="pi pi-check-circle" text size="small" severity="success" @click="doResolve(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="alert-empty">{{ t('admin.alerts.empty') }}</div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { get, post } from '@/utils/http';
import './Alerts.css';

const { t } = useI18n();
const toast = useToast();

interface AlertItem {
  id: number;
  batch_id: number;
  metric: string;
  value: number;
  threshold: number;
  direction: string;
  status: string;
  created_at: string;
}

const alerts = ref<AlertItem[]>([]);
const loading = ref(false);
const statusFilter = ref('');

const statusOptions = computed(() => [
  { label: t('admin.alerts.all'), value: '' },
  { label: t('admin.alerts.statuses.open'), value: 'open' },
  { label: t('admin.alerts.statuses.acknowledged'), value: 'acknowledged' },
  { label: t('admin.alerts.statuses.resolved'), value: 'resolved' }
]);

function statusSeverity(status: string): 'danger' | 'warn' | 'success' | 'info' {
  switch (status) {
    case 'open': return 'danger';
    case 'acknowledged': return 'warn';
    case 'resolved': return 'success';
    default: return 'info';
  }
}

async function loadList() {
  loading.value = true;
  try {
    const params: any = { page: 1, page_size: 100 };
    if (statusFilter.value) params.status = statusFilter.value;
    const res = await get<any>('/alert/list', params);
    alerts.value = res.data || [];
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function doAcknowledge(data: AlertItem) {
  try {
    await post('/alert/acknowledge', { id: data.id, status: 'acknowledged' });
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.alerts.acknowledged'), life: 3000 });
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

async function doResolve(data: AlertItem) {
  try {
    await post('/alert/resolve', { id: data.id, status: 'resolved' });
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.alerts.resolved'), life: 3000 });
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

onMounted(loadList);
</script>
