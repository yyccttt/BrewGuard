<template>
  <div class="sys-users">
    <div class="sys-toolbar">
      <h3 style="margin:0;color:#fff">{{ t('admin.system.menus.title') }}</h3>
      <Button :label="t('admin.system.menus.add')" icon="pi pi-plus" @click="openCreate(0)" />
    </div>

    <DataTable :value="treeData" :loading="loading" class="sys-table" :rows="50">
      <Column field="name" :header="t('admin.system.menus.name')" expander>
        <template #body="{ data }">
          <span :style="{ paddingLeft: (data._depth * 20) + 'px' }">
            <i v-if="data.children?.length" class="pi pi-folder" style="margin-right:6px;color:#ffb43b" />
            <i v-else class="pi pi-circle" style="margin-right:6px;color:rgba(255,255,255,0.3);font-size:8px" />
            {{ data.name }}
          </span>
        </template>
      </Column>
      <Column field="menu_type" :header="t('admin.system.menus.type')" style="width:100px">
        <template #body="{ data }"><Tag :value="data.menu_type || '-'" severity="info" /></template>
      </Column>
      <Column field="path" :header="t('admin.system.menus.path')" />
      <Column field="icon" :header="t('admin.system.menus.icon')" />
      <Column field="order" :header="t('admin.system.menus.order')" style="width:70px" />
      <Column :header="t('admin.system.menus.actions')" style="width:160px">
        <template #body="{ data }">
          <Button icon="pi pi-plus" text rounded size="small" @click="openCreate(data.id)" v-tooltip.top="t('admin.system.menus.addChild')" />
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty><div class="sys-empty">{{ t('admin.system.menus.empty') }}</div></template>
    </DataTable>

    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.system.menus.edit') : t('admin.system.menus.add')" modal class="sys-dialog">
      <div class="sys-form">
        <div class="sys-form-row"><label>{{ t('admin.system.menus.name') }}</label><InputText v-model="form.name" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.menus.type') }}</label>
          <Select v-model="form.menu_type" :options="typeOptions" optionLabel="label" optionValue="value" />
        </div>
        <div class="sys-form-row"><label>{{ t('admin.system.menus.path') }}</label><InputText v-model="form.path" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.menus.icon') }}</label><InputText v-model="form.icon" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.menus.component') }}</label><InputText v-model="form.component" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.menus.order') }}</label><InputText v-model.number="form.order" type="number" /></div>
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
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

interface Menu { id: number; name: string; menu_type?: string; path: string; icon?: string; component?: string; order: number; parent_id: number; _depth?: number; children?: Menu[] }
const menus = ref<Menu[]>([]);
const loading = ref(false);
const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<any>({ name: '', menu_type: 'MENU', path: '', icon: '', component: '', order: 0, parent_id: 0 });

const typeOptions = [
  { label: '目录 CATALOG', value: 'CATALOG' },
  { label: '菜单 MENU', value: 'MENU' },
  { label: '按钮 BUTTON', value: 'BUTTON' },
];

const treeData = computed(() => {
  const build = (parentId: number, depth: number): Menu[] => {
    const children = menus.value.filter((d) => d.parent_id === parentId).map((d) => ({ ...d, _depth: depth, children: build(d.id, depth + 1) }));
    return children.sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  return build(0, 0);
});

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/menu/list', { page: 1, page_size: 500 });
    menus.value = res.data || [];
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { loading.value = false; }
}

function openCreate(parentId: number) { editing.value = false; form.value = { name: '', menu_type: 'MENU', path: '', icon: '', component: '', order: 0, parent_id: parentId }; formVisible.value = true; }
function openEdit(d: Menu) { editing.value = true; form.value = { id: d.id, name: d.name, menu_type: d.menu_type, path: d.path, icon: d.icon, component: d.component, order: d.order, parent_id: d.parent_id }; formVisible.value = true; }

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value) await post('/menu/update', form.value);
    else await post('/menu/create', form.value);
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.menus.saveSuccess'), life: 3000 });
    formVisible.value = false; loadList();
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { submitting.value = false; }
}

function confirmDelete(d: Menu) {
  confirm.require({
    message: t('admin.system.menus.confirmDelete'), header: t('admin.system.menus.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try { await del('/menu/delete', { menu_id: d.id }); toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.menus.deleteSuccess'), life: 3000 }); loadList(); }
      catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
    },
  });
}

onMounted(loadList);
</script>
