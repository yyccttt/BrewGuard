<template>
  <div class="screen-wrapper">
    <div ref="screenRef" class="screen-container" :style="{ transform: `scale(${scaleRef})` }">
      <header class="screen-top">
        <div class="screen-top-side"><span class="screen-top-time">{{ now }}</span></div>
        <h1 class="screen-top-title">BrewGuard · 酿酒检测监控中心</h1>
        <div class="screen-top-side screen-top-right"><span class="screen-top-online">在线 {{ onlineCount }}</span></div>
      </header>

      <main class="screen-main">
        <div class="screen-col screen-col--left">
          <ScreenPanel title="发酵罐状态">
            <div class="screen-list">
              <div v-for="b in batches.slice(0, 8)" :key="b.id" class="screen-tank">
                <span class="screen-tank-dot" :class="`is-${b.status}`" />
                <span class="screen-tank-no">{{ b.batch_no }}</span>
                <span class="screen-tank-recipe">{{ b.recipe || '-' }}</span>
                <span class="screen-tank-status">{{ statusText(b.status) }}</span>
              </div>
              <div v-if="batches.length === 0" class="screen-loading">加载中...</div>
            </div>
          </ScreenPanel>
          <ScreenPanel title="批次合格率"><EChart :option="passRateOption" height="100%" /></ScreenPanel>
        </div>

        <div class="screen-col screen-col--center">
          <ScreenPanel title="实时检测曲线"><EChart :option="trendOption" height="100%" /></ScreenPanel>
          <ScreenPanel title="当前指标仪表">
            <div class="screen-gauges">
              <EChart :option="gaugeOption('温度', stats.avg_temperature ?? 0, '°C', 0, 40)" height="180px" />
              <EChart :option="gaugeOption('酒精度', stats.avg_abv ?? 0, '%', 0, 20)" height="180px" />
              <EChart :option="gaugeOption('pH', stats.avg_ph ?? 0, '', 2, 6)" height="180px" />
            </div>
          </ScreenPanel>
        </div>

        <div class="screen-col screen-col--right">
          <ScreenPanel title="告警流水">
            <div class="screen-alert-stream">
              <div v-for="(a, i) in alertStream" :key="a.id + '-' + i" class="screen-alert-item">
                <span class="screen-alert-time">{{ a.created_at?.slice(11, 19) }}</span>
                <span class="screen-alert-batch">{{ a.batch_id }}</span>
                <span class="screen-alert-metric">{{ metricText(a.metric) }}</span>
                <span class="screen-alert-value" :class="a.direction">{{ a.value }}</span>
              </div>
              <div v-if="alertStream.length === 0" class="screen-loading">暂无告警</div>
            </div>
          </ScreenPanel>
          <ScreenPanel title="酒类产能分布"><EChart :option="capacityOption" height="100%" /></ScreenPanel>
        </div>
      </main>

      <footer class="screen-kpi">
        <div class="screen-kpi-item"><span class="screen-kpi-value">{{ stats.batch_total ?? 0 }}</span><span class="screen-kpi-label">今日批次</span></div>
        <div class="screen-kpi-item"><span class="screen-kpi-value">{{ passRate }}%</span><span class="screen-kpi-label">合格率</span></div>
        <div class="screen-kpi-item"><span class="screen-kpi-value">{{ stats.avg_temperature?.toFixed(1) ?? '0.0' }}°C</span><span class="screen-kpi-label">平均温度</span></div>
        <div class="screen-kpi-item"><span class="screen-kpi-value screen-kpi-warn">{{ stats.alert_open ?? 0 }}</span><span class="screen-kpi-label">待处理告警</span></div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { get } from '@/utils/http';
import EChart from '@/components/common/EChart.vue';
import ScreenPanel from './ScreenPanel.vue';
import { useScreenScale } from '@/composables/useScreenScale';
import { useSharedWebSocket } from '@/composables/useWebSocket';

const { scaleRef, screenRef } = useScreenScale();

interface Batch { id: number; batch_no: string; recipe?: string; status: string }
interface AlertItem { id: number; batch_id: number; metric: string; value: number; direction: string; created_at: string }

const batches = ref<Batch[]>([]);
const alertStream = ref<AlertItem[]>([]);
const stats = ref<any>({});
const onlineCount = ref(1);
const now = ref(new Date().toLocaleTimeString());
let clockTimer: ReturnType<typeof setInterval> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

async function loadAll() {
  try {
    const [batchRes, statsRes, alertRes] = await Promise.all([
      get<any>('/batch/list', { page: 1, page_size: 8 }),
      get<any>('/stats/overview'),
      get<any>('/alert/list', { page: 1, page_size: 8, status: 'open' }),
    ]);
    batches.value = batchRes.data || [];
    stats.value = statsRes.data || {};
    alertStream.value = alertRes.data || [];
  } catch (e) { console.error('大屏数据加载失败', e); }
}

const passRate = computed(() => {
  const s = stats.value; const total = s.batch_total ?? 0;
  if (!total) return 0;
  return Math.round(((total - (s.batch_abnormal ?? 0)) / total) * 100);
});

const trendData = ref<{ temp: number[]; ph: number[]; abv: number[] }>({ temp: [], ph: [], abv: [] });

const trendOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: { textStyle: { color: '#ffd89b' }, top: 0 },
  grid: { left: 45, right: 20, top: 35, bottom: 40 },
  xAxis: { type: 'category', boundaryGap: false, axisLabel: { color: 'rgba(255,216,155,0.5)' } },
  yAxis: { type: 'value', axisLabel: { color: 'rgba(255,216,155,0.5)' }, splitLine: { lineStyle: { color: 'rgba(255,180,80,0.08)' } } },
  series: [
    { name: '温度', type: 'line', smooth: true, data: trendData.value.temp, itemStyle: { color: '#ff6b6b' }, areaStyle: { color: 'rgba(255,107,107,0.1)' } },
    { name: 'pH', type: 'line', smooth: true, data: trendData.value.ph, itemStyle: { color: '#4dabf7' } },
    { name: '酒精度', type: 'line', smooth: true, data: trendData.value.abv, itemStyle: { color: '#ffb43b' } },
  ],
}));

const passRateOption = computed(() => ({
  backgroundColor: 'transparent',
  series: [{
    type: 'gauge', radius: '90%', min: 0, max: 100,
    axisLine: { lineStyle: { width: 12, color: [[0.6, '#ff6b6b'], [0.85, '#ffb43b'], [1, '#7cff67']] } },
    progress: { show: true, width: 12 }, pointer: { itemStyle: { color: '#ffd89b' } },
    axisTick: { show: false }, splitLine: { length: 8, lineStyle: { color: 'rgba(255,216,155,0.3)' } },
    axisLabel: { color: 'rgba(255,216,155,0.4)', distance: -28, fontSize: 9 },
    detail: { valueAnimation: true, formatter: '{value}%', color: '#ffd89b', fontSize: 20, offsetCenter: [0, '65%'] },
    data: [{ value: passRate.value }],
  }],
}));

function gaugeOption(name: string, value: number, unit: string, min: number, max: number) {
  return {
    backgroundColor: 'transparent',
    title: { text: name, left: 'center', bottom: 0, textStyle: { color: '#ffd89b', fontSize: 12 } },
    series: [{
      type: 'gauge', radius: '85%', min, max,
      axisLine: { lineStyle: { width: 10, color: [[0.5, '#4dabf7'], [0.8, '#ffb43b'], [1, '#ff6b6b']] } },
      progress: { show: true, width: 10 }, pointer: { itemStyle: { color: '#ffd89b' } },
      axisTick: { show: false }, splitLine: { length: 6, lineStyle: { color: 'rgba(255,216,155,0.3)' } },
      axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: `{value} ${unit}`, color: '#fff', fontSize: 16, offsetCenter: [0, '50%'] },
      data: [{ value: Number(value.toFixed(1)) }],
    }],
  };
}

const capacityOption = computed(() => {
  const map: Record<string, number> = {};
  batches.value.forEach((b) => { const k = b.recipe || '未分类'; map[k] = (map[k] || 0) + 1; });
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 0, top: 'middle', textStyle: { color: '#ffd89b', fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'], label: { color: '#ffd89b' },
      data: Object.keys(map).map((n) => ({ name: n, value: map[n] })),
    }],
  };
});

function statusText(s: string) { return ({ fermenting: '发酵中', completed: '已完成', abnormal: '异常' } as any)[s] || s; }
function metricText(m: string) { return ({ temperature: '温度', ph: 'pH', abv: '酒精度' } as any)[m] || m; }

const ws = useSharedWebSocket();
let offDetection: (() => void) | null = null;
let offAlert: (() => void) | null = null;

onMounted(() => {
  loadAll();
  clockTimer = setInterval(() => { now.value = new Date().toLocaleTimeString(); }, 1000);
  refreshTimer = setInterval(loadAll, 30000);
  offDetection = ws.on('detection', (p) => {
    trendData.value.temp.push(p.temperature ?? 0);
    trendData.value.ph.push(p.ph ?? 0);
    trendData.value.abv.push(p.abv ?? 0);
    if (trendData.value.temp.length > 30) { trendData.value.temp.shift(); trendData.value.ph.shift(); trendData.value.abv.shift(); }
    loadAll();
  });
  offAlert = ws.on('alert', (p) => {
    alertStream.value.unshift({ id: p.id, batch_id: p.batch_id, metric: p.metric, value: p.value, direction: p.direction, created_at: new Date().toISOString() });
    if (alertStream.value.length > 8) alertStream.value.pop();
  });
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (refreshTimer) clearInterval(refreshTimer);
  if (offDetection) offDetection();
  if (offAlert) offAlert();
});
</script>

<style scoped>
.screen-wrapper { position: fixed; inset: 0; background: radial-gradient(ellipse at center, #1a1208 0%, #0a0604 70%); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.screen-container { width: 1920px; height: 1080px; flex-shrink: 0; display: flex; flex-direction: column; transform-origin: center center; color: #ffd89b; padding: 16px; box-sizing: border-box; gap: 12px; }
.screen-top { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 24px; background: linear-gradient(180deg, rgba(255,180,80,0.12), transparent); border-bottom: 1px solid rgba(255,180,80,0.25); }
.screen-top-title { font-size: 30px; font-weight: 700; letter-spacing: 4px; margin: 0; background: linear-gradient(90deg, #ffb43b, #fff, #ffb43b); -webkit-background-clip: text; background-clip: text; color: transparent; }
.screen-top-side { font-size: 14px; color: rgba(255,216,155,0.7); min-width: 200px; }
.screen-top-right { text-align: right; }
.screen-top-online { color: #7cff67; }
.screen-main { flex: 1; display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 12px; min-height: 0; }
.screen-col { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.screen-col > * { flex: 1; min-height: 0; }
.screen-col--center > :first-child { flex: 1.4; }
.screen-list, .screen-alert-stream { height: 100%; overflow: hidden; display: flex; flex-direction: column; gap: 6px; }
.screen-tank, .screen-alert-item { display: flex; align-items: center; gap: 10px; padding: 7px 10px; font-size: 13px; border-bottom: 1px solid rgba(255,180,80,0.06); }
.screen-tank-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.screen-tank-dot.is-fermenting { background: #4dabf7; }
.screen-tank-dot.is-completed { background: #7cff67; }
.screen-tank-dot.is-abnormal { background: #ff6b6b; animation: pulse 1.5s infinite; }
.screen-tank-no { color: #fff; font-weight: 600; min-width: 100px; }
.screen-tank-recipe { color: rgba(255,216,155,0.6); flex: 1; }
.screen-tank-status { color: #ffb43b; }
.screen-alert-time { color: rgba(255,216,155,0.5); min-width: 70px; font-family: monospace; }
.screen-alert-batch { color: #fff; min-width: 50px; }
.screen-alert-metric { color: rgba(255,216,155,0.7); flex: 1; }
.screen-alert-value.high { color: #ff6b6b; font-weight: 700; }
.screen-alert-value.low { color: #ffb43b; font-weight: 700; }
.screen-loading { color: rgba(255,216,155,0.4); text-align: center; padding: 2rem; font-size: 13px; }
.screen-gauges { display: flex; height: 100%; }
.screen-kpi { display: flex; align-items: center; justify-content: space-around; height: 90px; background: rgba(255,180,80,0.06); border-top: 1px solid rgba(255,180,80,0.2); border-radius: 6px; }
.screen-kpi-item { text-align: center; }
.screen-kpi-value { display: block; font-size: 36px; font-weight: 700; color: #ffb43b; font-family: 'Geist Mono', monospace; }
.screen-kpi-warn { color: #ff6b6b; }
.screen-kpi-label { font-size: 14px; color: rgba(255,216,155,0.6); margin-top: 4px; display: block; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
</style>
