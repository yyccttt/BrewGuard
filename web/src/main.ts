import './css/main.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import permission from './directives/permission';
import { useThemeStore, initThemeSystemListener } from './stores/themeStore';

// 把品牌色 #7cff67 注入 PrimeVue Aura 主题
const BrewGuardPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '#7cff67',
      600: '#5cd650',
      700: '#3da86a',
      800: '#2d8a52',
      900: '#1f6639',
      950: '#0f3d22'
    }
  }
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// 主题:在 mount 前应用持久化的主题模式,避免首屏闪烁
useThemeStore().apply();
initThemeSystemListener();

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: BrewGuardPreset,
    options: {
      darkModeSelector: '.app-dark'
    }
  }
});
app.use(ToastService);
app.use(ConfirmationService);
app.directive('tooltip', Tooltip);
app.directive('permission', permission);
app.mount('#app');
