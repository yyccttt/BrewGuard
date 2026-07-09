<template>
  <div class="batch-page">
    <div class="batch-toolbar">
      <h1 class="batch-title">{{ t('admin.batch.title') }}</h1>
      <div class="batch-toolbar-actions">
        <InputText v-model="searchNo" :placeholder="t('admin.batch.search')" @keyup.enter="crud.refresh()" class="batch-search" />
        <Button :label="t('admin.batch.add')" icon="pi pi-plus" @click="crud.openCreate()" />
      </div>
    </div>

    <DataTable
      :value="crud.list.value"
      :loading="crud.loading.value"
      :rows="crud.pageSize.value"
      :totalRecords="crud.total.value"
      :first="(crud.page.value - 1) * crud.pageSize.value"
      :lazy="true"
      @page="crud.onPage"
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
          <Button icon="pi pi-pencil" text rounded size="small" @click="crud.openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="batch-empty">{{ t('admin.batch.empty') }}</div>
      </template>
    </DataTable>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="crud.modal.visible.value" :header="crud.editing.value ? t('admin.batch.edit') : t('admin.batch.add')" modal class="batch-dialog">
      <div class="batch-form">
        <div class="batch-form-row">
          <label>{{ t('admin.batch.batchNo') }}</label>
          <InputText v-model="crud.form.data.value.batch_no" :disabled="crud.editing.value" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.recipe') }}</label>
          <InputText v-model="crud.form.data.value.recipe" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.status') }}</label>
          <Select v-model="crud.form.data.value.status" :options="statusOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="batch-form-row">
          <label>{{ t('admin.batch.remark') }}</label>
          <InputText v-model="crud.form.data.value.remark" />
        </div>
      </div>
      <template #footer>
        <Button :label="t('admin.batch.save') || 'Save'" icon="pi pi-check" @click="crud.submit()" :loading="crud.modal.loading.value" />
        <Button label="Cancel" icon="pi pi-times" text @click="crud.modal.close()" />
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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { useCrud } from '@/composables/useCrud';
import './BatchList.css';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();

interface Batch {
  id?: number;
  batch_no: string;
  recipe: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  remark: string;
}

const searchNo = ref('');

const crud = useCrud<Batch>({
  listUrl: '/batch/list',
  createUrl: '/batch/create',
  updateUrl: '/batch/update',
  deleteUrl: '/batch/delete',
  initForm: { batch_no: '', recipe: '', status: 'fermenting', start_time: null, end_time: null, remark: '' },
  buildQuery: () => ({ batch_no: searchNo.value }),
  validate: (d) => (d.batch_no ? null : t('admin.batch.batchNo')),
  messages: {
    saveSuccess: t('admin.batch.saveSuccess'),
    deleteSuccess: t('admin.batch.deleteSuccess'),
  },
});

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

function goDetail(data: Batch) {
  if (data.id) router.push(`/admin/batch/${data.id}`);
}

function confirmDelete(data: Batch) {
  confirm.require({
    message: t('admin.batch.confirmDelete'),
    header: t('admin.batch.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => crud.deleteRow(data),
  });
}

onMounted(crud.refresh);
</script>
