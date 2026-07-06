import { createI18n } from 'vue-i18n';

import en from './locales/en';
import zh from './locales/zh';

const STORAGE_KEY = 'brewguard_locale';

function getDefaultLocale(): 'en' | 'zh' {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'zh') return saved;
  return 'en';
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
});

export default i18n;
export { STORAGE_KEY };
