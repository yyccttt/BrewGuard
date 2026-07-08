<template>
  <div class="dash-page">
    <!-- 统计卡片 -->
    <div class="dash-cards">
      <template v-if="statsLoading && !statsLoaded">
        <div v-for="i in 5" :key="i" class="dash-card dash-card--skeleton">
          <Skeleton width="44px" height="44px" borderRadius="10px" />
          <div class="dash-card-body">
            <Skeleton width="60px" height="28px" />
            <Skeleton width="80px" height="14px" style="margin-top: 6px" />
          </div>
        </div>
      </template>
      <AnimatedContent
        v-else
        v-for="(card, i) in cards"
        :key="card.key"
        direction="vertical"
        :distance="40"
        :delay="i * 0.08"
        :duration="0.5"
      >
        <div class="dash-card" :class="`dash-card--${card.key}`">
          <div class="dash-card-icon"><i :class="card.icon" /></div>
          <div class="dash-card-body">
            <div class="dash-card-value">
              <CountUp v-if="card.decimals" :to="card.value" :duration="1.2" className="dash-count" />
              <template v-else>{{ card.value }}</template>
              <span v-if="card.suffix" class="dash-card-suffix">{{ card.suffix }}</span>
            </div>
            <div class="dash-card-label">{{ t(card.label) }}</div>
          </div>
        </div>
      </AnimatedContent>
    </div>

    <!-- 趋势折线图(真实数据) -->
    <div class="dash-chart-card">
      <div class="dash-chart-header">
        <div>
          <h3 class="dash-chart-title">{{ t('admin.dashboard.chart.trendTitle') }}</h3>
          <p class="dash-chart-subtitle">{{ t('admin.dashboard.chart.trendSubtitle') }}</p>
        </div>
        <span v-if="trendLoaded" class="dash-live-tag"><span class="dash-live-dot" />{{ t('admin.dashboard.live') }}</span>
      </div>
      <div class="dash-chart-body">
        <Skeleton v-if="trendLoading && !trendLoaded" height="100%" borderRadius="8px" />
        <div v-else-if="trendEmpty" class="dash-empty">
          <i class="pi pi-chart-line" />
          <p>{{ t('admin.dashboard.noTrendData') }}</p>
        </div>
        <Line v-else :data="trendData" :options="trendOptions" />
      </div>
    </div>

    <!-- 批次状态分布环形图(真实数据) -->
    <div class="dash-chart-card">
      <div class="dash-chart-header">
        <div>
          <h3 class="dash-chart-title">{{ t('admin.dashboard.chart.distTitle') }}</h3>
          <p class="dash-chart-subtitle">{{ t('admin.dashboard.chart.distSubtitle') }}</p>
        </div>
      </div>
      <div class="dash-dist-body">
        <div class="dash-dist-chart">
          <Doughnut :data="distData" :options="distOptions" />
        </div>
        <div class="dash-dist-legend">
          <div v-for="(item, i) in distLegend" :key="item.key" class="dash-dist-item">
            <span class="dash-dist-dot" :style="{ background: item.color }" />
            <span class="dash-dist-name">{{ t(`admin.dashboard.chart.${item.key}`) }}</span>
            <span class="dash-dist-count">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import Skeleton from 'primevue/skeleton';
import AnimatedContent from '@/content/Animations/AnimatedContent/AnimatedContent.vue';
import CountUp from '@/content/TextAnimations/CountUp/CountUp.vue';
import { get } from '@/utils/http';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTooltip,
  ChartLegend,
  Filler
);

const { t } = useI18n();

const REFRESH_MS = 30_000; // 30 秒自动刷新

// ===== 概览统计 =====
const stats = ref({
  batch_total: 0,
  batch_abnormal: 0,
  batch_fermenting: 0,
  batch_completed: 0,
  detection_total: 0,
  avg_temperature: 0,
  alert_open: 0,
  status_distribution: { fermenting: 0, completed: 0, abnormal: 0 }
});
const statsLoading = ref(false);
const statsLoaded = ref(false);

const cards = computed(() => [
  { key: 'batch', icon: 'pi pi-tags', value: stats.value.batch_total, suffix: '', label: 'admin.dashboard.cards.batchTotal', decimals: true },
  { key: 'abnormal', icon: 'pi pi-exclamation-triangle', value: stats.value.batch_abnormal, suffix: '', label: 'admin.dashboard.cards.batchAbnormal', decimals: true },
  { key: 'detection', icon: 'pi pi-database', value: stats.value.detection_total, suffix: '', label: 'admin.dashboard.cards.detectionTotal', decimals: true },
  { key: 'temp', icon: 'pi pi-sun', value: stats.value.avg_temperature, suffix: t('admin.dashboard.cards.tempUnit'), label: 'admin.dashboard.cards.avgTemp', decimals: true },
  { key: 'alert', icon: 'pi pi-bell', value: stats.value.alert_open || 0, suffix: '', label: 'admin.dashboard.cards.alertOpen', decimals: true }
]);

// ===== 趋势数据(真实接口) =====
const trendLabels = ref<string[]>([]);
const trendPoints = ref<Array<{ temperature: number | null; ph: number | null; abv: number | null }>>([]);
const trendLoading = ref(false);
const trendLoaded = ref(false);

// 是否完全无数据(所有点都为 null)
const trendEmpty = computed(() =>
  trendLoaded.value && trendPoints.value.every(p => p.temperature === null && p.ph === null && p.abv === null)
);

// Chart.js 需要数字,null 会被忽略以断开折线
const toSeries = (key: 'temperature' | 'ph' | 'abv') =>
  trendPoints.value.map(p => (p[key] === null ? null : p[key]));

const trendData = computed(() => ({
  labels: trendLabels.value,
  datasets: [
    {
      label: t('admin.dashboard.chart.tempLabel'),
      data: toSeries('temperature'),
      borderColor: '#7cff67',
      backgroundColor: 'rgba(124,255,103,0.1)',
      tension: 0.4,
      fill: true,
      yAxisID: 'y',
      spanGaps: true
    },
    {
      label: t('admin.dashboard.chart.phLabel'),
      data: toSeries('ph'),
      borderColor: '#5b9dff',
      backgroundColor: 'rgba(91,157,255,0.05)',
      tension: 0.4,
      fill: false,
      yAxisID: 'y1',
      spanGaps: true
    },
    {
      label: t('admin.dashboard.chart.abvLabel'),
      data: toSeries('abv'),
      borderColor: '#ffb347',
      backgroundColor: 'rgba(255,179,71,0.05)',
      tension: 0.4,
      fill: false,
      yAxisID: 'y',
      spanGaps: true
    }
  ]
}));

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      labels: { color: 'rgba(255,255,255,0.7)', font: { size: 12, family: 'Geist' }, usePointStyle: true, pointStyle: 'circle' as const }
    },
    tooltip: {
      backgroundColor: 'rgba(15,15,15,0.95)',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11, family: 'Geist Mono' }, maxTicksLimit: 12 }
    },
    y: {
      position: 'left' as const,
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11, family: 'Geist Mono' } }
    },
    y1: {
      position: 'right' as const,
      grid: { display: false },
      ticks: { color: 'rgba(91,157,255,0.6)', font: { size: 11, family: 'Geist Mono' } }
    }
  }
};

// ===== 环形图(真实数据) =====
const distColors = { fermenting: '#7cff67', completed: '#5b9dff', abnormal: '#ff6b6b' };

const distData = computed(() => ({
  labels: [t('admin.dashboard.chart.fermenting'), t('admin.dashboard.chart.completed'), t('admin.dashboard.chart.abnormal')],
  datasets: [
    {
      data: [
        stats.value.status_distribution.fermenting,
        stats.value.status_distribution.completed,
        stats.value.status_distribution.abnormal
      ],
      backgroundColor: [distColors.fermenting, distColors.completed, distColors.abnormal],
      borderColor: '#0f0f0f',
      borderWidth: 3
    }
  ]
}));

const distOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,15,15,0.95)',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)'
    }
  }
};

const distLegend = computed(() => [
  { key: 'fermenting', color: distColors.fermenting, value: stats.value.status_distribution.fermenting },
  { key: 'completed', color: distColors.completed, value: stats.value.status_distribution.completed },
  { key: 'abnormal', color: distColors.abnormal, value: stats.value.status_distribution.abnormal }
]);

// ===== 数据加载 =====
async function loadStats() {
  try {
    const res = await get<any>('/stats/overview');
    if (res.data) stats.value = res.data;
  } catch (e) {
    console.error('Failed to load stats', e);
  } finally {
    statsLoading.value = false;
    statsLoaded.value = true;
  }
}

async function loadTrends() {
  trendLoading.value = true;
  try {
    const res = await get<any>('/stats/trends', { hours: 24 });
    if (res.data) {
      trendLabels.value = res.data.labels || [];
      trendPoints.value = res.data.points || [];
    }
  } catch (e) {
    console.error('Failed to load trends', e);
  } finally {
    trendLoading.value = false;
    trendLoaded.value = true;
  }
}

async function refreshAll() {
  await Promise.all([loadStats(), loadTrends()]);
}

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  statsLoading.value = true;
  trendLoading.value = true;
  refreshAll();
  // 30 秒自动轮询刷新
  timer = setInterval(refreshAll, REFRESH_MS);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
