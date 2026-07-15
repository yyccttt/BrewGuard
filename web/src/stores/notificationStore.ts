import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 通知中心 Store — 管理 WebSocket 推送的未读告警,持久化到 localStorage。
 * 按级别分类:danger 严重 / warn 警告 / info 信息。
 */
export interface NotificationItem {
  id: number | string;
  title: string;
  desc: string;
  time: string;
  severity: 'danger' | 'warn' | 'info';
  read: boolean;
  path?: string;
}

const STORAGE_KEY = 'brewguard-notifications';
const MAX_ITEMS = 50;

function loadFromStorage(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const items = ref<NotificationItem[]>(loadFromStorage());
  const unreadCount = computed(() => items.value.filter((n) => !n.read).length);
  const grouped = computed(() => ({
    danger: items.value.filter((n) => n.severity === 'danger'),
    warn: items.value.filter((n) => n.severity === 'warn'),
    info: items.value.filter((n) => n.severity === 'info'),
  }));

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value.slice(0, MAX_ITEMS)));
  }

  function addNotification(item: NotificationItem) {
    if (items.value.some((n) => n.id === item.id)) return;
    items.value.unshift(item);
    if (items.value.length > MAX_ITEMS) items.value = items.value.slice(0, MAX_ITEMS);
    persist();
  }

  function markAsRead(id: number | string) {
    const n = items.value.find((x) => x.id === id);
    if (n) { n.read = true; persist(); }
  }

  function markGroupAsRead(severity: 'danger' | 'warn' | 'info') {
    items.value.forEach((n) => { if (n.severity === severity) n.read = true; });
    persist();
  }

  function markAllAsRead() {
    items.value.forEach((n) => (n.read = true));
    persist();
  }

  function clearAll() {
    items.value = [];
    persist();
  }

  return { items, unreadCount, grouped, addNotification, markAsRead, markGroupAsRead, markAllAsRead, clearAll };
});
