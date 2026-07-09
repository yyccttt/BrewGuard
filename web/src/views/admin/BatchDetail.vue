<template>
  <div class="detail-page">
    <div class="detail-back">
      <Button :label="t('admin.batch.back')" icon="pi pi-arrow-left" text @click="router.back()" />
    </div>

    <!-- 批次信息卡 -->
    <div class="detail-batch-card" v-if="batch">
      <div class="detail-batch-header">
        <h2 class="detail-batch-title">{{ batch.batch_no }}</h2>
        <Button :label="t('admin.batch.exportReport')" icon="pi pi-file-pdf" severity="help" size="small" :loading="exporting" @click="exportReport" />
      </div>
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
        <Button :label="t('admin.detection.add')" icon="pi pi-plus" @click="openCreate" />
      </div>

      <DataTable
        :value="records"
        :loading="loading"
        :rows="pageSize"
        :totalRecords="total"
        :first="(page - 1) * pageSize"
        :lazy="true"
        @page="onPage"
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
            <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteRecord(data)" />
          </template>
        </Column>
        <template #empty>
          <div class="detail-empty">{{ t('admin.detection.empty') }}</div>
        </template>
      </DataTable>
    </div>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.detection.edit') : t('admin.detection.add')" modal class="detail-dialog">
      <div class="detail-form">
        <div class="detail-form-row">
          <label>{{ t('admin.detection.temperature') }}</label>
          <InputText v-model.number="form.temperature" type="number" placeholder="22.5" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.ph') }}</label>
          <InputText v-model.number="form.ph" type="number" placeholder="4.2" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.abv') }}</label>
          <InputText v-model.number="form.abv" type="number" placeholder="5.5" />
        </div>
        <div class="detail-form-row">
          <label>{{ t('admin.detection.remark') }}</label>
          <InputText v-model="form.remark" />
        </div>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" @click="submitForm" :loading="submitting" />
        <Button label="Cancel" icon="pi pi-times" text @click="formVisible = false" />
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
import { get, post, del } from '@/utils/http';
import { exportBatchReport } from '@/utils/pdfReport';
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
const records = ref<Detection[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<Detection>({ batch_id: batchId, temperature: null, ph: null, abv: null, remark: '' });

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

async function loadRecords() {
  loading.value = true;
  try {
    const res = await get<any>('/detection/list', { page: page.value, page_size: pageSize.value, batch_id: batchId });
    records.value = res.data || [];
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
  loadRecords();
}

function openCreate() {
  editing.value = false;
  form.value = { batch_id: batchId, temperature: null, ph: null, abv: null, remark: '' };
  formVisible.value = true;
}

function openEdit(data: Detection) {
  editing.value = true;
  form.value = { ...data };
  formVisible.value = true;
}

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value && form.value.id) {
      await post('/detection/update', form.value);
    } else {
      await post('/detection/create', form.value);
    }
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.detection.saveSuccess'), life: 3000 });
    formVisible.value = false;
    loadRecords();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDeleteRecord(data: Detection) {
  confirm.require({
    message: t('admin.detection.confirmDelete'),
    header: t('admin.detection.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await del('/detection/delete', { id: data.id });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.detection.deleteSuccess'), life: 3000 });
        loadRecords();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      }
    }
  });
}

// PDF 报告导出:拉取该批次全部检测记录,生成质检报告
const exporting = ref(false);
async function exportReport() {
  if (!batch.value) return;
  exporting.value = true;
  try {
    // 拉取全部记录(不分页),用于完整报告
    const res = await get<any>('/detection/list', { page: 1, page_size: 10000, batch_id: batchId });
    const allRecords = res.data || [];
    await exportBatchReport(
      batch.value,
      allRecords,
      {
        reportTitle: t('admin.batch.reportTitle'),
        basicInfo: t('admin.batch.basicInfo'),
        status: t('admin.batch.status'),
        startTime: t('admin.batch.startTime'),
        endTime: t('admin.batch.endTime'),
        remark: t('admin.batch.remark'),
        recipe: t('admin.batch.recipe'),
        detectionRecords: t('admin.batch.detectionRecords'),
        temperature: t('admin.detection.temperature'),
        ph: t('admin.detection.ph'),
        abv: t('admin.detection.abv'),
        time: t('admin.detection.createdAt'),
        trend: t('admin.batch.trend'),
        generatedAt: t('admin.batch.generatedAt'),
      },
      t(`admin.batch.statuses.${batch.value.status}`),
    );
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.batch.exportDone'), life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  loadBatch();
  loadRecords();
});
</script>
