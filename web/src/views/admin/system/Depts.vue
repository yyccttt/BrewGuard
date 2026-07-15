<template>
  <div class="sys-users">
    <div class="sys-toolbar">
      <h3 style="margin:0;color:#fff">{{ t('admin.system.depts.title') }}</h3>
      <Button :label="t('admin.system.depts.add')" icon="pi pi-plus" @click="openCreate(0)" />
    </div>

    <DataTable :value="treeData" :loading="loading" class="sys-table" :rows="50">
      <Column field="name" :header="t('admin.system.depts.name')" expander>
        <template #body="{ data }">
          <span :style="{ paddingLeft: (data._depth * 20) + 'px' }">
            <i v-if="data.children?.length" class="pi pi-folder" style="margin-right:6px;color:#ffb43b" />
            <i v-else class="pi pi-circle" style="margin-right:6px;color:rgba(255,255,255,0.3);font-size:8px" />
            {{ data.name }}
          </span>
        </template>
      </Column>
      <Column field="desc" :header="t('admin.system.depts.desc')" />
      <Column field="order" :header="t('admin.system.depts.order')" style="width:80px" />
      <Column :header="t('admin.system.depts.actions')" style="width:160px">
        <template #body="{ data }">
          <Button icon="pi pi-plus" text rounded size="small" @click="openCreate(data.id)" v-tooltip.top="t('admin.system.depts.addChild')" />
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty><div class="sys-empty">{{ t('admin.system.depts.empty') }}</div></template>
    </DataTable>

    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.system.depts.edit') : t('admin.system.depts.add')" modal class="sys-dialog">
      <div class="sys-form">
        <div class="sys-form-row"><label>{{ t('admin.system.depts.name') }}</label><InputText v-model="form.name" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.depts.desc') }}</label><InputText v-model="form.desc" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.depts.order') }}</label><InputText v-model.number="form.order" type="number" /></div>
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
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

interface Dept { id: number; name: string; desc: string; order: number; parent_id: number; _depth?: number; children?: Dept[] }
const depts = ref<Dept[]>([]);
const loading = ref(false);
const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<any>({ name: '', desc: '', order: 0, parent_id: 0 });

// 构建树结构(扁平 -> 树 + depth,供 DataTable 缩进展示)
const treeData = computed(() => {
  const build = (parentId: number, depth: number): Dept[] => {
    const children = depts.value.filter((d) => d.parent_id === parentId).map((d) => ({ ...d, _depth: depth, children: build(d.id, depth + 1) }));
    return children.sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  return build(0, 0);
});

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/dept/list', { page: 1, page_size: 500 });
    depts.value = res.data || [];
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { loading.value = false; }
}

function openCreate(parentId: number) { editing.value = false; form.value = { name: '', desc: '', order: 0, parent_id: parentId }; formVisible.value = true; }
function openEdit(d: Dept) { editing.value = true; form.value = { id: d.id, name: d.name, desc: d.desc, order: d.order, parent_id: d.parent_id }; formVisible.value = true; }

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value) await post('/dept/update', form.value);
    else await post('/dept/create', form.value);
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.depts.saveSuccess'), life: 3000 });
    formVisible.value = false; loadList();
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { submitting.value = false; }
}

function confirmDelete(d: Dept) {
  confirm.require({
    message: t('admin.system.depts.confirmDelete'), header: t('admin.system.depts.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try { await del('/dept/delete', { dept_id: d.id }); toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.depts.deleteSuccess'), life: 3000 }); loadList(); }
      catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
    },
  });
}

onMounted(loadList);
</script>
