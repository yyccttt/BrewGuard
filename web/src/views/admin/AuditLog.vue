<template>
  <div class="auditlog-page">
    <div class="auditlog-toolbar">
      <h1 class="auditlog-title">{{ t('admin.auditlog.title') }}</h1>
    </div>

    <DataTable :value="logs" :loading="loading" :rows="pageSize" :totalRecords="total" :first="(page - 1) * pageSize" :lazy="true" @page="onPage" paginator :rowsPerPageOptions="[20, 50, 100]" class="auditlog-table">
      <Column field="username" :header="t('admin.auditlog.username')" style="width: 100px" />
      <Column field="module" :header="t('admin.auditlog.module')" style="width: 120px" />
      <Column field="summary" :header="t('admin.auditlog.summary')" />
      <Column :header="t('admin.auditlog.method')" style="width: 80px">
        <template #body="{ data }">
          <Tag :value="data.method" :severity="methodSeverity(data.method)" />
        </template>
      </Column>
      <Column field="path" :header="t('admin.auditlog.path')" style="width: 220px" />
      <Column :header="t('admin.auditlog.status')" style="width: 80px">
        <template #body="{ data }">
          <Tag :value="String(data.status)" :severity="data.status < 400 ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column field="response_time" :header="t('admin.auditlog.responseTime')" style="width: 100px" />
      <Column field="created_at" :header="t('admin.auditlog.time')" style="width: 160px" />
      <Column :header="t('admin.auditlog.details')" style="width: 80px">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text rounded size="small" @click="openDetail(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="auditlog-empty">{{ t('admin.auditlog.empty') }}</div>
      </template>
    </DataTable>

    <Dialog v-model:visible="detailVisible" :header="t('admin.auditlog.details')" modal class="auditlog-dialog">
      <div v-if="detail" class="auditlog-detail">
        <div class="auditlog-detail-row">
          <label>{{ t('admin.auditlog.requestArgs') }}</label>
          <pre>{{ formatJson(detail.request_args) }}</pre>
        </div>
        <div class="auditlog-detail-row">
          <label>{{ t('admin.auditlog.responseBody') }}</label>
          <pre>{{ formatJson(detail.response_body) }}</pre>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { get } from '@/utils/http';
import './AuditLog.css';

const { t } = useI18n();
const toast = useToast();

const logs = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

const detailVisible = ref(false);
const detail = ref<any>(null);

function methodSeverity(method: string): 'info' | 'success' | 'warn' | 'danger' {
  switch (method) {
    case 'GET': return 'info';
    case 'POST': return 'success';
    case 'PUT': return 'warn';
    case 'DELETE': return 'danger';
    default: return 'info';
  }
}

function formatJson(data: any): string {
  if (!data) return '-';
  try {
    return typeof data === 'string' ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function openDetail(data: any) {
  detail.value = data;
  detailVisible.value = true;
}

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/auditlog/list', { page: page.value, page_size: pageSize.value });
    logs.value = res.data || [];
    total.value = res.total || 0;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    loading.value = false;
  }
}

function onPage(event: any) {
  page.value = event.page + 1;
  pageSize.value = event.rows;
  loadList();
}

onMounted(loadList);
</script>
