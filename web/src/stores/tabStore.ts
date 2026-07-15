import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

/**
 * 多标签页导航 Store
 *
 * 数据结构:{ id, label, path, icon, closable }
 * - watch 路由变化自动 addTab
 * - Dashboard 标签固定不可关闭
 * - 关闭操作:当前/左侧/右侧/其他/全部
 *
 * 参考:soybean-admin/src/store/modules/tab/、vue-pure-admin/src/store/modules/multiTags.ts
 */

export interface TabItem {
  id: string;       // 路由 name 或 path 作为唯一标识
  label: string;    // 标签标题(已 i18n 解析后的文本)
  path: string;     // 完整路径(含参数,用于点击切换)
  name: string;     // 路由 name(KeepAlive 匹配用)
  icon?: string;    // 图标 class
  closable: boolean; // 是否可关闭
}

// 菜单图标映射(与 AdminLayout menuItems 保持一致)
const TAB_ICON_MAP: Record<string, string> = {
  dashboard: 'pi pi-chart-line',
  batch: 'pi pi-tags',
  'batch-detail': 'pi pi-tags',
  alerts: 'pi pi-bell',
  system: 'pi pi-cog',
};

// 菜单标题 i18n key 映射
const TAB_LABEL_KEY: Record<string, string> = {
  dashboard: 'admin.menu.dashboard',
  batch: 'admin.menu.batch',
  'batch-detail': 'admin.menu.batch',
  alerts: 'admin.menu.alerts',
  system: 'admin.menu.system',
};

export const useTabStore = defineStore('tab', () => {
  // 默认固定 Dashboard 标签
  const tabs = ref<TabItem[]>([
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', name: 'dashboard', icon: 'pi pi-chart-line', closable: false },
  ]);

  // 当前激活的 tab id
  const activeId = ref<string>('dashboard');

  function findIndex(id: string): number {
    return tabs.value.findIndex((t) => t.id === id);
  }

  // 根据当前路由添加标签(去重)
  function addTab(route: RouteLocationNormalized, labelResolver?: (key: string, fallback: string) => string) {
    const name = String(route.name || '');
    // 非后台路由不纳入标签
    if (!name || !route.path.startsWith('/admin')) return;
    // Dashboard 已固定,跳过
    if (name === 'dashboard') {
      activeId.value = 'dashboard';
      return;
    }

    const id = name === 'batch-detail' ? `batch-detail-${route.params.id ?? ''}` : name;
    const icon = TAB_ICON_MAP[name];
    const labelKey = TAB_LABEL_KEY[name];
    // 详情页用批次编号 + id 做标题;其余用 i18n 文案
    const fallback = name === 'batch-detail' ? `批次 #${route.params.id ?? ''}` : (route.meta?.title as string || name);
    const label = labelKey
      ? (labelResolver ? labelResolver(labelKey, fallback) : fallback)
      : fallback;

    const idx = findIndex(id);
    if (idx >= 0) {
      // 已存在,仅激活
      activeId.value = id;
      // 详情页 label 可能因 id 变化,更新一下
      tabs.value[idx].label = label;
      tabs.value[idx].path = route.fullPath;
      return;
    }

    tabs.value.push({
      id,
      label,
      path: route.fullPath,
      name,
      icon,
      closable: true,
    });
    activeId.value = id;
  }

  // 关闭指定标签,返回应跳转的目标路径(关闭当前时需要跳转)
  function closeTab(id: string): string | null {
    const idx = findIndex(id);
    if (idx < 0) return null;
    if (!tabs.value[idx].closable) return null; // 固定标签不可关闭
    tabs.value.splice(idx, 1);
    // 若关闭的是当前激活标签,跳到相邻标签
    if (activeId.value === id) {
      const next = tabs.value[idx] || tabs.value[idx - 1] || tabs.value[0];
      if (next) {
        activeId.value = next.id;
        return next.path;
      }
    }
    return null;
  }

  function closeOthers(id: string): string | null {
    const keep = tabs.value.filter((t) => !t.closable || t.id === id);
    tabs.value = keep;
    if (activeId.value !== id) {
      activeId.value = id;
      const target = keep.find((t) => t.id === id);
      return target ? target.path : null;
    }
    return null;
  }

  function closeLeft(id: string): string | null {
    const idx = findIndex(id);
    if (idx <= 0) return null;
    // 保留固定标签 + 当前及右侧
    tabs.value = tabs.value.filter((t, i) => !t.closable || i >= idx);
    return null;
  }

  function closeRight(id: string): string | null {
    const idx = findIndex(id);
    if (idx < 0) return null;
    // 若当前激活在被关的右侧,需跳回当前
    const activeInRight = findIndex(activeId.value) > idx;
    tabs.value = tabs.value.filter((t, i) => !t.closable || i <= idx);
    if (activeInRight) {
      activeId.value = id;
      return tabs.value[idx]?.path || null;
    }
    return null;
  }

  function closeAll(): string | null {
    tabs.value = tabs.value.filter((t) => !t.closable);
    activeId.value = tabs.value[0]?.id || 'dashboard';
    return tabs.value[0]?.path || null;
  }

  function setActive(id: string) {
    activeId.value = id;
  }

  return { tabs, activeId, addTab, closeTab, closeOthers, closeLeft, closeRight, closeAll, setActive };
});
