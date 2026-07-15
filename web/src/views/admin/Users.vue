<template>
  <div class="users-page">
    <div class="users-toolbar">
      <h1 class="users-title">{{ t('admin.users.title') }}</h1>
      <Button :label="t('admin.users.add')" icon="pi pi-plus" @click="openCreate" />
    </div>

    <DataTable :value="users" :loading="loading" :rows="pageSize" :totalRecords="total" :first="(page - 1) * pageSize" :lazy="true" @page="onPage" paginator :rowsPerPageOptions="[10, 20, 50]" class="users-table">
      <Column field="username" :header="t('admin.users.username')" />
      <Column field="alias" :header="t('admin.users.alias')" />
      <Column field="email" :header="t('admin.users.email')" />
      <Column :header="t('admin.users.roles')">
        <template #body="{ data }">
          <Tag v-for="r in (data.roles || [])" :key="r.id" :value="r.name" class="users-role-tag" />
        </template>
      </Column>
      <Column :header="t('admin.users.status')" style="width: 90px">
        <template #body="{ data }">
          <Tag :value="data.is_active ? t('admin.users.active') : t('admin.users.inactive')" :severity="data.is_active ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column field="last_login" :header="t('admin.users.lastLogin')" style="width: 160px" />
      <Column :header="t('admin.users.actions')" style="width: 120px">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" />
          <Button icon="pi pi-trash" text rounded size="small" severity="danger" :disabled="data.is_superuser" @click="confirmDelete(data)" />
        </template>
      </Column>
      <template #empty>
        <div class="users-empty">{{ t('admin.users.empty') }}</div>
      </template>
    </DataTable>

    <Dialog v-model:visible="formVisible" :header="editing ? t('admin.users.edit') : t('admin.users.add')" modal class="users-dialog">
      <div class="users-form">
        <div class="users-form-row">
          <label>{{ t('admin.users.username') }}</label>
          <InputText v-model="form.username" :disabled="editing" />
        </div>
        <div class="users-form-row">
          <label>{{ t('admin.users.alias') }}</label>
          <InputText v-model="form.alias" />
        </div>
        <div class="users-form-row">
          <label>{{ t('admin.users.email') }}</label>
          <InputText v-model="form.email" type="email" />
        </div>
        <div class="users-form-row" v-if="!editing">
          <label>{{ t('admin.users.password') }}</label>
          <InputText v-model="form.password" type="password" />
        </div>
        <div class="users-form-row">
          <label>{{ t('admin.users.status') }}</label>
          <Select v-model="form.is_active" :options="[{label: t('admin.users.active'), value: true}, {label: t('admin.users.inactive'), value: false}]" optionLabel="label" optionValue="value" />
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
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { get, post, del } from '@/utils/http';
import './Users.css';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const users = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);

const formVisible = ref(false);
const editing = ref(false);
const submitting = ref(false);
const form = ref<any>({ username: '', alias: '', email: '', password: '', is_active: true });

async function loadList() {
  loading.value = true;
  try {
    const res = await get<any>('/user/list', { page: page.value, page_size: pageSize.value });
    users.value = res.data || [];
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

function openCreate() {
  editing.value = false;
  form.value = { username: '', alias: '', email: '', password: '', is_active: true };
  formVisible.value = true;
}

function openEdit(data: any) {
  editing.value = true;
  form.value = { id: data.id, username: data.username, alias: data.alias, email: data.email, is_active: data.is_active };
  formVisible.value = true;
}

async function submitForm() {
  submitting.value = true;
  try {
    if (editing.value) {
      await post('/user/update', form.value);
    } else {
      await post('/user/create', { ...form.value, role_ids: [], dept_id: 0 });
    }
    toast.add({ severity: 'success', summary: 'OK', detail: t('admin.users.saveSuccess'), life: 3000 });
    formVisible.value = false;
    loadList();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(data: any) {
  confirm.require({
    message: t('admin.users.confirmDelete'),
    header: t('admin.users.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await del('/user/delete', { user_id: data.id });
        toast.add({ severity: 'success', summary: 'OK', detail: t('admin.users.deleteSuccess'), life: 3000 });
        loadList();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: (e as Error).message, life: 3000 });
      }
    }
  });
}

onMounted(loadList);
</script>
