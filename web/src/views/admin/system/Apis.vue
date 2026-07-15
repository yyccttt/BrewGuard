<template>
  <div class="sys-users">
    <div class="sys-toolbar">
      <InputText v-model="searchPath" :placeholder="t('admin.system.apis.search')" @keyup.enter="loadList" class="sys-search" />
      <Button :label="t('admin.system.apis.refresh')" icon="pi pi-sync" severity="success" :loading="refreshing" @click="refreshApi" />
    </div>

    <DataTable :value="apis" :loading="loading" :rows="pageSize" :totalRecords="total"
      :first="(page - 1) * pageSize" :lazy="true" @page="onPage" paginator :rowsPerPageOptions="[10,20,50]" class="sys-table">
      <Column field="method" :header="t('admin.system.apis.method')" style="width:90px">
        <template #body="{ data }"><Tag :value="data.method" :severity="methodSeverity(data.method)" /></template>
      </Column>
      <Column field="path" :header="t('admin.system.apis.path')" />
      <Column field="summary" :header="t('admin.system.apis.summary')" />
      <Column field="tags" :header="t('admin.system.apis.tags')" />
      <template #empty><div class="sys-empty">{{ t('admin.system.apis.empty') }}</div></template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { get, post } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const toast = useToast();

const apis = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const searchPath = ref('');
const refreshing = ref(false);

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/api/list', { page: page.value, page_size: pageSize.value, path: searchPath.value });
    apis.value = res.data || [];
    total.value = res.total || 0;
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { loading.value = false; }
}

async function refreshApi() {
  refreshing.value = true;
  try {
    await post('/api/refresh_api');
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.apis.refreshDone'), life: 3000 });
    await loadList();
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { refreshing.value = false; }
}

function onPage(e: any) { page.value = e.page + 1; pageSize.value = e.rows; loadList(); }

function methodSeverity(m: string): any {
  return { GET: 'info', POST: 'success', PUT: 'warn', DELETE: 'danger', PATCH: 'warn' }[m] || 'info';
}

onMounted(loadList);
</script>
