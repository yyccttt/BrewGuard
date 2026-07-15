<template>
  <div class="sys-users">
    <div class="sys-toolbar">
      <InputText v-model="searchName" :placeholder="t('admin.system.roles.search')" @keyup.enter="loadList" class="sys-search" />
      <Button :label="t('admin.system.roles.add')" icon="pi pi-plus" @click="openCreate" />
    </div>

    <DataTable :value="roles" :loading="loading" :rows="pageSize" :totalRecords="total"
      :first="(page - 1) * pageSize" :lazy="true" @page="onPage" paginator :rowsPerPageOptions="[10,20,50]" class="sys-table">
      <Column field="name" :header="t('admin.system.roles.name')" />
      <Column field="desc" :header="t('admin.system.roles.desc')" />
      <Column :header="t('admin.system.roles.users')">
        <template #body="{ data }">{{ (data.users || []).length }}</template>
      </Column>
      <Column :header="t('admin.system.roles.actions')" style="width:200px">
        <template #body="{ data }">
          <Button icon="pi pi-shield" text rounded size="small" @click="openAuth(data)" v-tooltip.top="t('admin.system.roles.assignPerm')" />
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty><div class="sys-empty">{{ t('admin.system.roles.empty') }}</div></template>
    </DataTable>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.system.roles.edit') : t('admin.system.roles.add')" modal class="sys-dialog">
      <div class="sys-form">
        <div class="sys-form-row"><label>{{ t('admin.system.roles.name') }}</label><InputText v-model="form.name" /></div>
        <div class="sys-form-row"><label>{{ t('admin.system.roles.desc') }}</label><InputText v-model="form.desc" /></div>
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" @click="submitForm" :loading="submitting" />
        <Button label="Cancel" icon="pi pi-times" text @click="formVisible = false" />
      </template>
    </Dialog>

    <!-- 权限分配 Dialog -->
    <Dialog v-model:visible="authVisible" :header="t('admin.system.roles.assignPerm')" modal class="sys-auth-dialog">
      <div class="sys-auth">
        <p class="sys-auth-hint">{{ t('admin.system.roles.permHint') }}</p>
        <h4>{{ t('admin.system.roles.menus') }}</h4>
        <MultiSelect v-model="authForm.menu_ids" :options="menuOptions" optionLabel="name" optionValue="id" display="chip" class="w-full" />
        <h4 style="margin-top:1rem">{{ t('admin.system.roles.apis') }}</h4>
        <MultiSelect v-model="authForm.api_infos" :options="apiOptions" optionLabel="summary" optionValue="_info" display="chip" filter class="w-full" />
      </div>
      <template #footer>
        <Button label="Save" icon="pi pi-check" @click="submitAuth" :loading="submitting" />
        <Button label="Cancel" icon="pi pi-times" text @click="authVisible = false" />
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
import MultiSelect from 'primevue/multiselect';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

interface Role { id: number; name: string; desc: string; users?: any[]; menus?: any[]; apis?: any[] }
const roles = ref<Role[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchName = ref('');

const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<any>({ name: '', desc: '' });

// 权限分配
const authVisible = ref(false);
const authForm = ref<any>({ id: 0, menu_ids: [], api_infos: [] });
const menuOptions = ref<any[]>([]);
const apiOptions = ref<any[]>([]);

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/role/list', { page: page.value, page_size: pageSize.value, role_name: searchName.value });
    roles.value = res.data || [];
    total.value = res.total || 0;
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { loading.value = false; }
}

async function loadOptions() {
  try {
    const [menus, apis] = await Promise.all([
      get<any>('/menu/list', { page: 1, page_size: 200 }),
      get<any>('/api/list', { page: 1, page_size: 500 }),
    ]);
    menuOptions.value = menus.data || [];
    // api_infos 格式:[{method, path}],_info 作为唯一标识
    apiOptions.value = (apis.data || []).map((a: any) => ({ ...a, _info: JSON.stringify({ method: a.method, path: a.path }) }));
  } catch { /* ignore */ }
}

function onPage(e: any) { page.value = e.page + 1; pageSize.value = e.rows; loadList(); }
function openCreate() { editing.value = false; form.value = { name: '', desc: '' }; formVisible.value = true; }
function openEdit(d: Role) { editing.value = true; form.value = { id: d.id, name: d.name, desc: d.desc }; formVisible.value = true; }

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value) await post('/role/update', form.value);
    else await post('/role/create', form.value);
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.roles.saveSuccess'), life: 3000 });
    formVisible.value = false; loadList();
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { submitting.value = false; }
}

function confirmDelete(d: Role) {
  confirm.require({
    message: t('admin.system.roles.confirmDelete'), header: t('admin.system.roles.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try { await del('/role/delete', { role_id: d.id }); toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.roles.deleteSuccess'), life: 3000 }); loadList(); }
      catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
    },
  });
}

async function openAuth(d: Role) {
  authForm.value = { id: d.id, menu_ids: (d.menus || []).map((m) => m.id), api_infos: (d.apis || []).map((a) => JSON.stringify({ method: a.method, path: a.path })) };
  await loadOptions();
  authVisible.value = true;
}

async function submitAuth() {
  submitting.value = true;
  try {
    // api_infos 从字符串还原为 {method,path} 对象
    const api_infos = authForm.value.api_infos.map((s: string) => JSON.parse(s));
    await post('/role/authorized', { id: authForm.value.id, menu_ids: authForm.value.menu_ids, api_infos });
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.roles.permSaved'), life: 3000 });
    authVisible.value = false; loadList();
  } catch (e) { toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 }); }
  finally { submitting.value = false; }
}

onMounted(loadList);
</script>
