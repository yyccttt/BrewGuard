import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

/**
 * 主题切换 Store(Pinia Setup Store)
 *
 * 三种模式:light / dark / auto(跟随系统)
 * - dark:给 <html> 加 .app-dark(PrimeVue 用此 darkModeSelector),后台根变量保持暗色
 * - light:移除 .app-dark,并通过 [data-theme='light'] 用 CSS 变量覆盖为浅色
 * - auto:根据 prefers-color-scheme 决定,并监听系统变化
 *
 * 参考:soybean-admin/src/store/modules/theme/index.ts
 *   (defineStore + darkMode computed + toggleCssDarkMode + localStorage 持久化)
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'brewguard-theme';

// 读取持久化的模式,默认 dark(项目原本为暗色系)
function readMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  return 'dark';
}

// 当前系统是否偏好暗色
function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readMode());

  // 解析后的实际是否暗色(auto 时跟随系统)
  const isDark = computed(() => {
    if (mode.value === 'auto') return systemPrefersDark();
    return mode.value === 'dark';
  });

  // 应用到 <html>:PrimeVue darkModeSelector 为 .app-dark,后台浅色变量用 data-theme
  function apply() {
    const root = document.documentElement;
    if (isDark.value) {
      root.classList.add('app-dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('app-dark');
      root.setAttribute('data-theme', 'light');
    }
  }

  function setMode(next: ThemeMode) {
    mode.value = next;
    localStorage.setItem(STORAGE_KEY, next);
    apply();
  }

  // 便捷切换:light <-> dark(auto 不参与循环,由 UI 显式三选一)
  function toggle() {
    setMode(isDark.value ? 'light' : 'dark');
  }

  // mode / isDark 变化时自动应用
  watch([mode, isDark], apply, { immediate: true });

  return { mode, isDark, setMode, toggle, apply };
});

/**
 * 初始化:监听系统主题变化(auto 模式生效)。
 * 在应用启动(main.ts)时调用一次。
 */
export function initThemeSystemListener() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const store = useThemeStore();
    // auto 模式下系统变化需重新应用
    if (store.mode === 'auto') {
      store.apply();
    }
  };
  // addEventListener 兼容性更好,部分浏览器仍需 addListener
  if (mql.addEventListener) {
    mql.addEventListener('change', handler);
  } else if ((mql as any).addListener) {
    (mql as any).addListener(handler);
  }
}
