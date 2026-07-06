import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { STORAGE_KEY } from '@/i18n';

export type Locale = 'en' | 'zh';

export function useLocale() {
  const { locale, t } = useI18n();

  const current = computed<Locale>(() => locale.value as Locale);

  function setLocale(value: Locale) {
    locale.value = value;
    localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en';
  }

  function toggle() {
    setLocale(current.value === 'en' ? 'zh' : 'en');
  }

  return { current, t, setLocale, toggle };
}
