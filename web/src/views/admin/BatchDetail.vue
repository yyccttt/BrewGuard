<template>
  <div class="detail-page">
    <div class="detail-back">
      <Button :label="t('admin.batch.back')" icon="pi pi-arrow-left" text @click="router.back()" />
    </div>

    <!-- 批次信息卡 -->
    <div class="detail-batch-card" v-if="batch">
      <div class="detail-batch-header">
        <h2 class="detail-batch-title">{{ batch.batch_no }}</h2>
        <div class="detail-batch-actions">
          <Button v-if="batch.status === 'fermenting'" :label="t('admin.batch.finishFerment')" icon="pi pi-flag" severity="success" size="small" :loading="finishing" @click="finishFerment" />
          <Button :label="t('admin.batch.exportReport')" icon="pi pi-file-pdf" severity="help" size="small" :loading="exporting" @click="exportReport" />
        </div>
      </div>
      <div class="detail-batch-meta">
        <span class="detail-meta-item"><i class="pi pi-tag" /> {{ batch.recipe || '-' }}</span>
        <Tag :value="t(`admin.batch.statuses.${batch.status}`)" :severity="batchSeverity(batch.status)" />
        <span class="detail-meta-item" v-if="batch.start_time"><i class="pi pi-clock" /> {{ batch.start_time }}</span>
      </div>
      <p class="detail-batch-remark" v-if="batch.remark">{{ batch.remark }}</p>
    </div>

    <!-- 检测趋势图(温度 / pH / 酒精度) -->
    <div class="detail-trend-card" v-if="crud.list.value.length > 0">
      <div class="detail-trend-header">
        <h3 class="detail-section-title">{{ t('admin.batch.trend') }}</h3>
      </div>
      <EChart :option="trendOption" height="300px" />
    </div>

    <!-- 检测记录列表 -->
    <div class="detail-section">
      <div class="detail-toolbar">
        <h3 class="detail-section-title">{{ t('admin.detection.title') }}</h3>
        <div class="detail-toolbar-actions">
          <Button :label="t('common.export')" icon="pi pi-file-excel" severity="success" size="small" :loading="exportingRecords" @click="exportRecords" />
          <Button :label="t('admin.batch.importDetections')" icon="pi pi-upload" severity="secondary" size="small" @click="importVisible = true" />
          <Button :label="t('admin.detection.add')" icon="pi pi-plus" @click="crud.openCreate()" v-permission="'detection:create'" />
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

    <!-- 批量导入 Dialog (#42) -->
    <Dialog v-model:visible="importVisible" :header="t('admin.batch.importDetections')" modal class="detail-dialog">
      <div class="detail-import">
        <p class="detail-import-hint">{{ t('admin.batch.importHint') }}</p>
        <FileUpload
          mode="basic"
          accept=".csv,.xlsx"
          :maxFileSize="5000000"
          :label="t('admin.batch.chooseFile')"
          :chooseLabel="t('admin.batch.chooseFile')"
          @select="onImportFile"
          :auto="true"
          customUpload
        />
        <div v-if="importResult" class="detail-import-result">
          <p>{{ importResult.msg }}</p>
          <div v-if="importResult.data?.errors?.length" class="detail-import-errors">
            <div v-for="(err, i) in importResult.data.errors" :key="i">{{ err }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button :label="t('admin.batch.downloadTemplate')" icon="pi pi-download" severity="secondary" text @click="downloadTpl" />
        <Button label="OK" icon="pi pi-check" @click="importVisible = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
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
import FileUpload from 'primevue/fileupload';
import EChart from '@/components/common/EChart.vue';
import { get, post } from '@/utils/http';
import { downloadFile } from '@/utils/download';
import { useCrud } from '@/composables/useCrud';
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
  created_at?: string;
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

// 趋势图:温度(左轴)/ 酒精度(左轴)/ pH(右轴),双 Y 轴 + dataZoom
const trendOption = computed(() => {
  const records = crud.list.value;
  const labels = records.map((r) => (r.created_at ? String(r.created_at).replace('T', ' ').slice(11, 16) : ''));
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,15,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
    legend: {
      data: [t('admin.detection.temperature'), t('admin.detection.ph'), t('admin.detection.abv')],
      textStyle: { color: 'rgba(255,255,255,0.7)' }, top: 0,
    },
    grid: { left: 50, right: 50, top: 40, bottom: 50 },
    xAxis: { type: 'category', data: labels, axisLabel: { color: 'rgba(255,255,255,0.4)' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
    yAxis: [
      { type: 'value', name: '温度/酒精度', axisLabel: { color: 'rgba(255,255,255,0.4)' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
      { type: 'value', name: 'pH', axisLabel: { color: 'rgba(91,157,255,0.6)' }, splitLine: { show: false } },
    ],
    series: [
      { name: t('admin.detection.temperature'), type: 'line', smooth: true, data: records.map((r) => r.temperature), connectNulls: true, itemStyle: { color: '#7cff67' }, areaStyle: { color: 'rgba(124,255,103,0.1)' } },
      { name: t('admin.detection.ph'), type: 'line', smooth: true, yAxisIndex: 1, data: records.map((r) => r.ph), connectNulls: true, itemStyle: { color: '#5b9dff' } },
      { name: t('admin.detection.abv'), type: 'line', smooth: true, data: records.map((r) => r.abv), connectNulls: true, itemStyle: { color: '#ffb347' } },
    ],
  };
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

// #43 结束发酵:状态流转为 completed + 填充 end_time
const finishing = ref(false);
async function finishFerment() {
  if (!batch.value) return;
  confirm.require({
    message: t('admin.batch.finishConfirm'),
    header: t('admin.batch.finishFerment'),
    icon: 'pi pi-flag',
    accept: async () => {
      finishing.value = true;
      try {
        await post('/batch/finish', {}, { params: { id: batchId } });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.batch.finished'), life: 3000 });
        await loadBatch();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      } finally {
        finishing.value = false;
      }
    },
  });
}

// #40 导出该批次检测记录 Excel
const exportingRecords = ref(false);
async function exportRecords() {
  exportingRecords.value = true;
  try {
    await downloadFile('/detection/export', { batch_id: batchId });
    toast.add({ severity: 'success', summary: 'OK', detail: t('common.exportDone'), life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    exportingRecords.value = false;
  }
}

// #42 批量导入检测记录
const importVisible = ref(false);
const importResult = ref<any>(null);
async function onImportFile(event: any) {
  const file = event.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('batch_id', String(batchId));
  try {
    const res = await post<any>('/detection/import', formData);
    importResult.value = res;
    toast.add({ severity: 'success', summary: 'OK', detail: res.msg, life: 4000 });
    crud.refresh();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

async function downloadTpl() {
  try {
    await downloadFile('/detection/template');
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

onMounted(() => {
  loadBatch();
  crud.refresh();
});
</script>
