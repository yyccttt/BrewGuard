<template>
  <div class="sys-audit">
    <!-- 筛选区 -->
    <div class="sys-filter">
      <InputText v-model="filter.username" :placeholder="t('admin.system.auditLog.username')" class="sys-filter-input" />
      <InputText v-model="filter.module" :placeholder="t('admin.system.auditLog.module')" class="sys-filter-input" />
      <InputText v-model="filter.method" :placeholder="t('admin.system.auditLog.method')" class="sys-filter-input-sm" />
      <InputText v-model="filter.path" :placeholder="t('admin.system.auditLog.path')" class="sys-filter-input" />
      <InputText v-model="filter.status" :placeholder="t('admin.system.auditLog.status')" class="sys-filter-input-sm" type="number" />
      <Button :label="t('admin.system.auditLog.filter')" icon="pi pi-search" size="small" @click="loadList" />
      <Button :label="t('admin.system.auditLog.reset')" icon="pi pi-refresh" size="small" severity="secondary" text @click="resetFilter" />
    </div>

    <DataTable
      :value="logs"
      :loading="loading"
      :rows="pageSize"
      :totalRecords="total"
      :first="(page - 1) * pageSize"
      :lazy="true"
      @page="onPage"
      paginator
      :rowsPerPageOptions="[10, 20, 50]"
      class="sys-table"
    >
      <Column field="created_at" :header="t('admin.system.auditLog.time')" style="width: 160px" />
      <Column field="username" :header="t('admin.system.auditLog.username')" style="width: 110px" />
      <Column field="module" :header="t('admin.system.auditLog.module')" style="width: 110px" />
      <Column field="method" :header="t('admin.system.auditLog.method')" style="width: 80px" />
      <Column field="path" :header="t('admin.system.auditLog.path')" />
      <Column field="summary" :header="t('admin.system.auditLog.summary')" />
      <Column :header="t('admin.system.auditLog.status')" style="width: 90px">
        <template #body="{ data }">
          <Tag :value="String(data.status)"
               :severity="data.status >= 200 && data.status < 300 ? 'success' : data.status >= 400 ? 'danger' : 'info'" />
        </template>
      </Column>
      <Column :header="t('admin.system.auditLog.actions')" style="width: 90px">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text rounded size="small" @click="openDetail(data)" v-tooltip.top="t('admin.system.auditLog.detail')" />
        </template>
      </Column>
      <template #empty>
        <div class="sys-empty">{{ t('admin.system.auditLog.empty') }}</div>
      </template>
    </DataTable>

    <!-- 详情 Dialog -->
    <Dialog v-model:visible="detailVisible" :header="t('admin.system.auditLog.detail')" modal class="sys-detail-dialog">
      <div v-if="detail" class="sys-detail">
        <div class="sys-detail-row"><span class="sys-detail-key">{{ t('admin.system.auditLog.time') }}</span><span>{{ detail.created_at }}</span></div>
        <div class="sys-detail-row"><span class="sys-detail-key">{{ t('admin.system.auditLog.username') }}</span><span>{{ detail.username }}</span></div>
        <div class="sys-detail-row"><span class="sys-detail-key">{{ t('admin.system.auditLog.method') }}</span><span>{{ detail.method }}</span></div>
        <div class="sys-detail-row"><span class="sys-detail-key">{{ t('admin.system.auditLog.path') }}</span><span>{{ detail.path }}</span></div>
        <div class="sys-detail-row"><span class="sys-detail-key">{{ t('admin.system.auditLog.status') }}</span><span>{{ detail.status }}</span></div>
        <div class="sys-detail-section">
          <div class="sys-detail-key">{{ t('admin.system.auditLog.requestArgs') }}</div>
          <pre class="sys-detail-pre">{{ formatJson(detail.request_args) }}</pre>
        </div>
        <div class="sys-detail-section">
          <div class="sys-detail-key">{{ t('admin.system.auditLog.responseBody') }}</div>
          <pre class="sys-detail-pre">{{ formatJson(detail.response_body) }}</pre>
        </div>
      </div>
      <template #footer>
        <Button label="OK" icon="pi pi-check" @click="detailVisible = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { get } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const toast = useToast();

interface AuditLog {
  id: number;
  created_at: string;
  username: string;
  module: string;
  method: string;
  path: string;
  summary: string;
  status: number;
  request_args: any;
  response_body: any;
}

const logs = ref<AuditLog[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

const filter = reactive({ username: '', module: '', method: '', path: '', status: '' as string });

const detailVisible = ref(false);
const detail = ref<AuditLog | null>(null);

function buildQuery() {
  const q: Record<string, any> = { page: page.value, page_size: pageSize.value };
  if (filter.username) q.username = filter.username;
  if (filter.module) q.module = filter.module;
  if (filter.method) q.method = filter.method;
  if (filter.path) q.path = filter.path;
  if (filter.status) q.status = Number(filter.status);
  return q;
}

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/auditlog/list', buildQuery());
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

function resetFilter() {
  filter.username = '';
  filter.module = '';
  filter.method = '';
  filter.path = '';
  filter.status = '';
  page.value = 1;
  loadList();
}

function openDetail(data: AuditLog) {
  detail.value = data;
  detailVisible.value = true;
}

function formatJson(val: any): string {
  if (val == null) return '-';
  if (typeof val === 'string') {
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return val;
    }
  }
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

onMounted(loadList);
</script>
