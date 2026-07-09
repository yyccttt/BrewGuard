<template>
  <div class="batch-page">
    <div class="batch-toolbar">
      <h1 class="batch-title">{{ t('admin.batch.title') }}</h1>
      <div class="batch-toolbar-actions">
        <InputText v-model="searchNo" :placeholder="t('admin.batch.search')" @keyup.enter="loadList" class="batch-search" />
        <Button :label="t('admin.batch.add')" icon="pi pi-plus" @click="openCreate" />
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
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
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

        <!-- 告警阈值配置区 -->
        <div class="batch-threshold">
          <div class="batch-threshold-title">{{ t('admin.batch.thresholdConfig') }}</div>
          <div class="batch-threshold-hint">{{ t('admin.batch.thresholdHint') }}</div>
          <div class="batch-threshold-row">
            <span class="batch-threshold-label">{{ t('admin.batch.tempRange') }}</span>
            <div class="batch-threshold-inputs">
              <InputNumber v-model="form.temp_min" :placeholder="t('admin.batch.min')" :maxFractionDigits="2" />
              <span class="batch-threshold-sep">~</span>
              <InputNumber v-model="form.temp_max" :placeholder="t('admin.batch.max')" :maxFractionDigits="2" />
            </div>
          </div>
          <div class="batch-threshold-row">
            <span class="batch-threshold-label">{{ t('admin.batch.phRange') }}</span>
            <div class="batch-threshold-inputs">
              <InputNumber v-model="form.ph_min" :placeholder="t('admin.batch.min')" :maxFractionDigits="2" />
              <span class="batch-threshold-sep">~</span>
              <InputNumber v-model="form.ph_max" :placeholder="t('admin.batch.max')" :maxFractionDigits="2" />
            </div>
          </div>
          <div class="batch-threshold-row">
            <span class="batch-threshold-label">{{ t('admin.batch.abvRange') }}</span>
            <div class="batch-threshold-inputs">
              <InputNumber v-model="form.abv_min" :placeholder="t('admin.batch.min')" :maxFractionDigits="2" />
              <span class="batch-threshold-sep">~</span>
              <InputNumber v-model="form.abv_max" :placeholder="t('admin.batch.max')" :maxFractionDigits="2" />
            </div>
          </div>
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
import InputNumber from 'primevue/inputnumber';
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
  temp_min: number | null;
  temp_max: number | null;
  ph_min: number | null;
  ph_max: number | null;
  abv_min: number | null;
  abv_max: number | null;
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
const form = ref<Batch>(defaultForm());

function defaultForm(): Batch {
  return {
    batch_no: '',
    recipe: '',
    status: 'fermenting',
    start_time: null,
    end_time: null,
    remark: '',
    temp_min: null,
    temp_max: null,
    ph_min: null,
    ph_max: null,
    abv_min: null,
    abv_max: null,
  };
}

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
  form.value = defaultForm();
  formVisible.value = true;
}

function openEdit(data: Batch) {
  editing.value = true;
  // 编辑时补齐阈值字段(后端未配置时可能缺失),避免 InputNumber 绑定 undefined
  form.value = { ...defaultForm(), ...data };
  formVisible.value = true;
}

// 校验阈值:min 必须小于 max(两者都填了才校验)
function validateThresholds(): string | null {
  const f = form.value;
  const pairs: [number | null, number | null][] = [
    [f.temp_min, f.temp_max],
    [f.ph_min, f.ph_max],
    [f.abv_min, f.abv_max],
  ];
  for (const [min, max] of pairs) {
    if (min !== null && min !== undefined && max !== null && max !== undefined && Number(min) >= Number(max)) {
      return t('admin.batch.thresholdInvalid');
    }
  }
  return null;
}

async function submitForm() {
  // 提交前校验阈值
  const err = validateThresholds();
  if (err) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: err, life: 3000 });
    return;
  }
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
