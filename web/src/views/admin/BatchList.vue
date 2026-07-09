<template>
  <div class="batch-page">
    <div class="batch-toolbar">
      <h1 class="batch-title">{{ t('admin.batch.title') }}</h1>
      <div class="batch-toolbar-actions">
        <InputText v-model="searchNo" :placeholder="t('admin.batch.search')" @keyup.enter="loadList" class="batch-search" />
        <Button :label="t('admin.batch.add')" icon="pi pi-plus" @click="openCreate" v-permission="'batch:create'" />
      </div>
    </div>

    <DataTable
      :value="batches"
      :loading="loading"
      :rows="pageSize"
      :totalRecords="total"
      :first="(page - 1) * pageSize"
      :lazy="true"
      @page="onPage"
      paginator
      :rowsPerPageOptions="[10, 20, 50]"
      class="batch-table"
    >
      <Column field="batch_no" :header="t('admin.batch.batchNo')" />
      <Column field="recipe" :header="t('admin.batch.recipe')" />
      <Column field="status" :header="t('admin.batch.status')">
        <template #body="{ data }">
          <Tag :value="t(`admin.batch.statuses.${data.status}`)" :severity="statusSeverity(data.status)" />
        </template>
      </Column>
      <Column field="start_time" :header="t('admin.batch.startTime')" />
      <Column field="remark" :header="t('admin.batch.remark')" />
      <Column :header="t('admin.batch.actions')" style="width: 180px">
        <template #body="{ data }">
          <Button icon="pi pi-eye" text rounded size="small" @click="goDetail(data)" v-tooltip.top="t('admin.batch.detail')" />
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" v-permission="'batch:update'" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" v-permission="'batch:delete'" />
        </template>
      </Column>
      <template #empty>
        <div class="batch-empty">{{ t('admin.batch.empty') }}</div>
      </template>
    </DataTable>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.batch.edit') : t('admin.batch.add')" modal class="batch-dialog">
      <div class="batch-form">
        <div class="batch-form-row">
          <label>{{ t('admin.batch.batchNo') }}</label>
          <InputText v-model="form.batch_no" :disabled="editing" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.recipe') }}</label>
          <InputText v-model="form.recipe" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.status') }}</label>
          <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.remark') }}</label>
          <InputText v-model="form.remark" />
        </div>
      </div>
      <template #footer>
        <Button :label="t('admin.batch.save') || 'Save'" icon="pi pi-check" @click="submitForm" :loading="submitting" />
        <Button label="Cancel" icon="pi pi-times" text @click="formVisible = false" />
      </template>
    </Dialog>

    <!-- 删除确认 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './BatchList.css';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

interface Batch {
  id?: number;
  batch_no: string;
  recipe: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  remark: string;
}

const batches = ref<Batch[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const searchNo = ref('');

const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<Batch>({ batch_no: '', recipe: '', status: 'fermenting', start_time: null, end_time: null, remark: '' });

const statusOptions = computed(() => [
  { label: t('admin.batch.statuses.fermenting'), value: 'fermenting' },
  { label: t('admin.batch.statuses.completed'), value: 'completed' },
  { label: t('admin.batch.statuses.abnormal'), value: 'abnormal' }
]);

function statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
  switch (status) {
    case 'completed': return 'success';
    case 'fermenting': return 'info';
    case 'abnormal': return 'danger';
    default: return 'info';
  }
}

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/batch/list', { page: page.value, page_size: pageSize.value, batch_no: searchNo.value });
    batches.value = res.data || [];
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

function goDetail(data: Batch) {
  if (data.id) router.push(`/admin/batch/${data.id}`);
}

function openCreate() {
  editing.value = false;
  form.value = { batch_no: '', recipe: '', status: 'fermenting', start_time: null, end_time: null, remark: '' };
  formVisible.value = true;
}

function openEdit(data: Batch) {
  editing.value = true;
  form.value = { ...data };
  formVisible.value = true;
}

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value && form.value.id) {
      await post('/batch/update', form.value);
    } else {
      await post('/batch/create', form.value);
    }
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.batch.saveSuccess'), life: 3000 });
    formVisible.value = false;
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(data: Batch) {
  confirm.require({
    message: t('admin.batch.confirmDelete'),
    header: t('admin.batch.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await del('/batch/delete', { id: data.id });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.batch.deleteSuccess'), life: 3000 });
        loadList();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      }
    }
  });
}

onMounted(loadList);
</script>
