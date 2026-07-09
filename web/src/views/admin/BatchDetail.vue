<template>
  <div class="detail-page">
    <div class="detail-back">
      <Button :label="t('admin.batch.back')" icon="pi pi-arrow-left" text @click="router.back()" />
    </div>

    <!-- 批次信息卡 -->
    <div class="detail-batch-card" v-if="batch">
      <h2 class="detail-batch-title">{{ batch.batch_no }}</h2>
      <div class="detail-batch-meta">
        <span class="detail-meta-item"><i class="pi pi-tag" /> {{ batch.recipe || '-' }}</span>
        <Tag :value="t(`admin.batch.statuses.${batch.status}`)" :severity="batchSeverity(batch.status)" />
        <span class="detail-meta-item" v-if="batch.start_time"><i class="pi pi-clock" /> {{ batch.start_time }}</span>
      </div>
      <p class="detail-batch-remark" v-if="batch.remark">{{ batch.remark }}</p>
    </div>

    <!-- 检测记录列表 -->
    <div class="detail-section">
      <div class="detail-toolbar">
        <h3 class="detail-section-title">{{ t('admin.detection.title') }}</h3>
        <Button :label="t('admin.detection.add')" icon="pi pi-plus" @click="crud.openCreate()" v-permission="'detection:create'" />
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
        class="detail-table"
      >
        <Column field="temperature" :header="t('admin.detection.temperature')" />
        <Column field="ph" :header="t('admin.detection.ph')" />
        <Column field="abv" :header="t('admin.detection.abv')" />
        <Column field="remark" :header="t('admin.detection.remark')" />
        <Column field="created_at" :header="t('admin.detection.createdAt')" />
        <Column :header="t('admin.detection.actions')" style="width: 140px">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text rounded size="small" @click="crud.openEdit(data)" v-permission="'detection:update'" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteRecord(data)" v-permission="'detection:delete'" />
          </template>
        </Column>
        <template #empty>
          <div class="detail-empty">{{ t('admin.detection.empty') }}</div>
        </template>
      </DataTable>
    </div>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="crud.modal.visible.value" :header="crud.editing.value ? t('admin.detection.edit') : t('admin.detection.add')" modal class="detail-dialog">
      <div class="detail-form">
        <div class="detail-form-row">
          <label>{{ t('admin.detection.temperature') }}</label>
          <InputText v-model.number="crud.form.data.value.temperature" type="number" placeholder="22.5" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.ph') }}</label>
          <InputText v-model.number="crud.form.data.value.ph" type="number" placeholder="4.2" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.abv') }}</label>
          <InputText v-model.number="crud.form.data.value.abv" type="number" placeholder="5.5" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.remark') }}</label>
          <InputText v-model="crud.form.data.value.remark" />
        </div>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" @click="crud.submit()" :loading="crud.modal.loading.value" />
        <Button label="Cancel" icon="pi pi-times" text @click="crud.modal.close()" />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get } from '@/utils/http';
import { useCrud } from '@/composables/useCrud';
import './BatchDetail.css';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const batchId = Number(route.params.id);

interface Batch {
  id: number;
  batch_no: string;
  recipe: string;
  status: string;
  start_time: string | null;
  remark: string;
}

interface Detection {
  id?: number;
  batch_id: number;
  temperature: number | null;
  ph: number | null;
  abv: number | null;
  remark: string;
}

const batch = ref<Batch | null>(null);

// 检测记录的 CRUD 用 useCrud 封装,buildQuery 固定带 batch_id
const crud = useCrud<Detection>({
  listUrl: '/detection/list',
  createUrl: '/detection/create',
  updateUrl: '/detection/update',
  deleteUrl: '/detection/delete',
  initForm: { batch_id: batchId, temperature: null, ph: null, abv: null, remark: '' },
  buildQuery: () => ({ batch_id: batchId }),
  messages: {
    saveSuccess: t('admin.detection.saveSuccess'),
    deleteSuccess: t('admin.detection.deleteSuccess'),
  },
});

function batchSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
  switch (status) {
    case 'completed': return 'success';
    case 'fermenting': return 'info';
    case 'abnormal': return 'danger';
    default: return 'info';
  }
}

async function loadBatch() {
  try {
    const res = await get<any>('/batch/get', { id: batchId });
    batch.value = res.data;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

function confirmDeleteRecord(data: Detection) {
  confirm.require({
    message: t('admin.detection.confirmDelete'),
    header: t('admin.detection.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => crud.deleteRow(data),
  });
}

onMounted(() => {
  loadBatch();
  crud.refresh();
});
</script>
