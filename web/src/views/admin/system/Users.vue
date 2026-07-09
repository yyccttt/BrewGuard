<template>
  <div class="sys-users">
    <div class="sys-toolbar">
      <InputText v-model="searchUsername" :placeholder="t('admin.system.users.search')" @keyup.enter="loadList" class="sys-search" />
      <Button :label="t('admin.system.users.add')" icon="pi pi-plus" @click="openCreate" />
    </div>

    <DataTable
      :value="users"
      :loading="loading"
      :rows="pageSize"
      :totalRecords="total"
      :first="(page - 1) * pageSize"
      :lazy="true"
      @page="onPage"
      paginator
      :rowsPerPageOptions="[10, 20, 50]"
      class="sys-table"
    >
      <Column field="username" :header="t('admin.system.users.username')" />
      <Column field="email" :header="t('admin.system.users.email')" />
      <Column :header="t('admin.system.users.status')">
        <template #body="{ data }">
          <Tag :value="data.is_active ? t('admin.system.users.active') : t('admin.system.users.inactive')"
               :severity="data.is_active ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column :header="t('admin.system.users.superuser')" style="width: 90px">
        <template #body="{ data }">
          <Tag v-if="data.is_superuser" value="✓" severity="info" />
        </template>
      </Column>
      <Column field="roles" :header="t('admin.system.users.roles')">
        <template #body="{ data }">
          <span v-if="data.roles && data.roles.length">{{ data.roles.map((r: any) => r.name).join(', ') }}</span>
          <span v-else>-</span>
        </template>
      </Column>
      <Column :header="t('admin.system.users.actions')" style="width: 200px">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" v-tooltip.top="t('admin.system.users.edit')" />
          <Button icon="pi pi-key" text rounded size="small" severity="warn" @click="resetPassword(data)" v-tooltip.top="t('admin.system.users.resetPassword')" />
          <Button :icon="data.is_active ? 'pi pi-times' : 'pi pi-check'" text rounded size="small"
                  :severity="data.is_active ? 'secondary' : 'success'" @click="toggleActive(data)"
                  v-tooltip.top="t('admin.system.users.toggleActive')" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="sys-empty">{{ t('admin.system.users.empty') }}</div>
      </template>
    </DataTable>

    <!-- 新建/编辑 Dialog -->
    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.system.users.edit') : t('admin.system.users.add')" modal class="sys-dialog">
      <div class="sys-form">
        <div class="sys-form-row">
          <label>{{ t('admin.system.users.username') }}</label>
          <InputText v-model="form.username" />
        </div>
        <div class="sys-form-row">
          <label>{{ t('admin.system.users.email') }}</label>
          <InputText v-model="form.email" type="email" />
        </div>
        <div class="sys-form-row" v-if="!editing">
          <label>{{ t('admin.system.users.password') }}</label>
          <InputText v-model="form.password" type="password" />
        </div>
        <div class="sys-form-row">
          <label>{{ t('admin.system.users.roles') }}</label>
          <MultiSelect v-model="form.role_ids" :options="roleOptions" optionLabel="name" optionValue="id"
                       display="chip" :placeholder="t('admin.system.users.roles')" />
        </div>
        <div class="sys-form-row sys-form-inline">
          <div class="sys-form-inline-item">
            <label>{{ t('admin.system.users.active') }}</label>
            <ToggleSwitch v-model="form.is_active" />
          </div>
          <div class="sys-form-inline-item">
            <label>{{ t('admin.system.users.superuser') }}</label>
            <ToggleSwitch v-model="form.is_superuser" />
          </div>
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
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import ToggleSwitch from 'primevue/toggleswitch';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './SystemPages.css';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

interface UserRow {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  roles?: { id: number; name: string }[];
}

interface UserForm {
  id?: number;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  is_superuser: boolean;
  role_ids: number[];
  dept_id?: number;
}

const users = ref<UserRow[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchUsername = ref('');

const roleOptions = ref<{ id: number; name: string }[]>([]);
const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<UserForm>(defaultForm());

function defaultForm(): UserForm {
  return { username: '', email: '', password: '', is_active: true, is_superuser: false, role_ids: [], dept_id: 0 };
}

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/user/list', { page: page.value, page_size: pageSize.value, username: searchUsername.value });
    users.value = res.data || [];
    total.value = res.total || 0;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function loadRoles() {
  try {
    const res = await get<any>('/role/list', { page: 1, page_size: 100 });
    roleOptions.value = (res.data || []).map((r: any) => ({ id: r.id, name: r.name }));
  } catch {
    roleOptions.value = [];
  }
}

function onPage(event: any) {
  page.value = event.page + 1;
  pageSize.value = event.rows;
  loadList();
}

function openCreate() {
  editing.value = false;
  form.value = defaultForm();
  formVisible.value = true;
}

function openEdit(data: UserRow) {
  editing.value = true;
  form.value = {
    id: data.id,
    username: data.username,
    email: data.email,
    password: '',
    is_active: data.is_active,
    is_superuser: data.is_superuser,
    role_ids: (data.roles || []).map((r) => r.id),
    dept_id: 0,
  };
  formVisible.value = true;
}

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value && form.value.id) {
      // 更新不带 password
      const { password, ...updateData } = form.value;
      await post('/user/update', updateData);
    } else {
      await post('/user/create', form.value);
    }
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.users.saveSuccess'), life: 3000 });
    formVisible.value = false;
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(data: UserRow) {
  confirm.require({
    message: t('admin.system.users.confirmDelete'),
    header: t('admin.system.users.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        // 后端删除用 query 参数 user_id
        await del('/user/delete', { user_id: data.id });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.users.deleteSuccess'), life: 3000 });
        loadList();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      }
    },
  });
}

// 重置密码为 123456
function resetPassword(data: UserRow) {
  confirm.require({
    message: t('admin.system.users.resetPasswordConfirm'),
    header: t('admin.system.users.resetPassword'),
    icon: 'pi pi-key',
    accept: async () => {
      try {
        await post('/user/reset_password', { user_id: data.id });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.system.users.resetPasswordDone'), life: 3000 });
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      }
    },
  });
}

// 启用/禁用切换
async function toggleActive(data: UserRow) {
  try {
    await post('/user/update', {
      id: data.id,
      email: data.email,
      username: data.username,
      is_active: !data.is_active,
      is_superuser: data.is_superuser,
      role_ids: (data.roles || []).map((r) => r.id),
      dept_id: 0,
    });
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  }
}

onMounted(() => {
  loadRoles();
  loadList();
});
</script>
