<template>
  <div class="notif-bell">
    <Button icon="pi pi-bell" severity="secondary" text rounded size="small" @click="toggle" aria-haspopup="true" aria-controls="notif-panel" />
    <Badge v-if="notif.unreadCount.value > 0" :value="notif.unreadCount.value > 99 ? '99+' : notif.unreadCount.value" severity="danger" class="notif-badge" />

    <OverlayPanel ref="panelRef" id="notif-panel" class="notif-panel">
      <div class="notif-header">
        <span class="notif-header-title">{{ t('common.notification.title') }}</span>
        <Button v-if="notif.unreadCount.value > 0" :label="t('common.notification.markAllRead')" size="small" text severity="secondary" @click="notif.markAllAsRead()" />
      </div>

      <div class="notif-tabs">
        <button v-for="tab in tabs" :key="tab.key" class="notif-tab" :class="{ 'is-active': activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.label }}
          <span v-if="tab.count > 0" class="notif-tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="notif-list">
        <div v-if="currentList.length === 0" class="notif-empty">{{ t('common.notification.empty') }}</div>
        <div v-for="item in currentList" :key="item.id" class="notif-item" :class="{ 'is-unread': !item.read }" @click="onClickItem(item)">
          <span class="notif-dot" :class="`notif-dot--${item.severity}`" />
          <div class="notif-item-body">
            <div class="notif-item-title">{{ item.title }}</div>
            <div class="notif-item-desc">{{ item.desc }}</div>
            <div class="notif-item-time">{{ item.time }}</div>
          </div>
        </div>
      </div>

      <div class="notif-footer">
        <Button :label="t('common.notification.viewAll')" size="small" text @click="goAlerts" />
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import OverlayPanel from 'primevue/overlaypanel';
import { useNotificationStore, type NotificationItem } from '@/stores/notificationStore';
import { useSharedWebSocket } from '@/composables/useWebSocket';

const { t } = useI18n();
const router = useRouter();
const notif = useNotificationStore();

const panelRef = ref<InstanceType<typeof OverlayPanel> | null>(null);
const activeTab = ref<'danger' | 'warn' | 'info'>('danger');

const tabs = computed(() => [
  { key: 'danger' as const, label: t('common.notification.severe'), count: notif.grouped.value.danger.filter((n) => !n.read).length },
  { key: 'warn' as const, label: t('common.notification.warning'), count: notif.grouped.value.warn.filter((n) => !n.read).length },
  { key: 'info' as const, label: t('common.notification.info'), count: notif.grouped.value.info.filter((n) => !n.read).length },
]);

const currentList = computed(() => notif.grouped.value[activeTab.value].slice(0, 20));

function toggle(event: Event) { panelRef.value?.toggle(event); }
function onClickItem(item: NotificationItem) {
  notif.markAsRead(item.id);
  if (item.path) { router.push(item.path); panelRef.value?.hide(); }
}
function goAlerts() { router.push('/admin/alerts'); panelRef.value?.hide(); }

// WebSocket:收到新告警 -> 加入通知中心
const ws = useSharedWebSocket();
let offAlert: (() => void) | null = null;

onMounted(() => {
  offAlert = ws.on('alert', (payload) => {
    const severity: NotificationItem['severity'] = payload.direction === 'high' ? 'danger' : 'warn';
    const metricText = t(`admin.alerts.metrics.${payload.metric}`);
    const dirText = t(`admin.alerts.directions.${payload.direction}`);
    notif.addNotification({
      id: payload.id,
      title: `${payload.batch_no || ('#' + payload.batch_id)} ${metricText}`,
      desc: `${metricText} ${payload.value} ${dirText} (${t('admin.alerts.threshold')}: ${payload.threshold})`,
      time: new Date().toLocaleString(),
      severity,
      read: false,
      path: '/admin/alerts',
    });
  });
});

onUnmounted(() => { if (offAlert) offAlert(); });
</script>

<style scoped>
.notif-bell { position: relative; display: inline-flex; }
.notif-badge { position: absolute; top: -2px; right: -2px; transform: scale(0.85); transform-origin: top right; }
.notif-panel :deep(.p-overlaypanel-content) { padding: 0; width: 340px; }
.notif-header { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.notif-header-title { font-weight: 600; color: rgba(255,255,255,0.9); font-size: 0.92rem; }
.notif-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); }
.notif-tab { flex: 1; padding: 0.5rem; background: transparent; border: none; color: rgba(255,255,255,0.5); font-size: 0.78rem; cursor: pointer; border-bottom: 2px solid transparent; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; }
.notif-tab.is-active { color: var(--color-primary, #7cff67); border-bottom-color: var(--color-primary, #7cff67); }
.notif-tab-count { background: #ff6b6b; color: #fff; font-size: 0.65rem; padding: 0 5px; border-radius: 8px; min-width: 16px; text-align: center; }
.notif-list { max-height: 320px; overflow-y: auto; }
.notif-empty { text-align: center; padding: 2rem 1rem; color: rgba(255,255,255,0.35); font-size: 0.85rem; }
.notif-item { display: flex; gap: 0.6rem; padding: 0.7rem 1rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.12s ease; }
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item.is-unread { background: rgba(124,255,103,0.04); }
.notif-dot { flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; }
.notif-dot--danger { background: #ff6b6b; }
.notif-dot--warn { background: #ffd43b; }
.notif-dot--info { background: #4dabf7; }
.notif-item-body { flex: 1; min-width: 0; }
.notif-item-title { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 500; }
.notif-item-desc { color: rgba(255,255,255,0.55); font-size: 0.76rem; margin-top: 2px; }
.notif-item-time { color: rgba(255,255,255,0.3); font-size: 0.7rem; margin-top: 4px; }
.notif-footer { padding: 0.6rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
</style>
