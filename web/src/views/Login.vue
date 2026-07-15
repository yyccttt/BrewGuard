<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true" />
    <div class="login-card">
      <div class="login-logo">
        <img :src="logo" alt="BrewGuard" />
      </div>
      <h1 class="login-title">BrewGuard</h1>
      <p class="login-subtitle">{{ t('login.subtitle') }}</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-field">
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="form.username" :placeholder="t('login.username')" class="login-input" autofocus />
          </span>
        </div>
        <div class="login-field">
          <span class="p-input-icon-left">
            <i class="pi pi-lock" />
            <InputText v-model="form.password" :placeholder="t('login.password')" type="password" class="login-input" />
          </span>
        </div>
        <Button type="submit" :label="t('login.button')" :loading="loading" class="login-submit" />
      </form>

      <p class="login-hint">{{ t('login.hint') }}</p>
      <a href="/" class="login-back">{{ t('login.back') }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import logo from '@/assets/logos/brewguard-logo.svg';
import { useUserStore } from '@/stores/user';
import './Login.css';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const userStore = useUserStore();

const form = reactive({ username: '', password: '' });
const loading = ref(false);

async function handleLogin() {
  if (!form.username || !form.password) return;
  loading.value = true;
  try {
    await userStore.login(form.username, form.password);
    toast.add({ severity: 'success', summary: t('login.success'), life: 2000 });
    router.push('/admin/dashboard');
  } catch (e) {
    toast.add({ severity: 'error', summary: t('login.failed'), detail: (e as Error).message, life: 3000 });
  } finally {
    loading.value = false;
  }
}
</script>
