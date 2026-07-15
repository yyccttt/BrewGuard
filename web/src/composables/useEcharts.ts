import { ref, shallowRef, onScopeDispose } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, RadarChart, GaugeChart, HeatmapChart } from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DataZoomComponent, RadarComponent, ToolboxComponent, GraphicComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 按需注册(tree-shaking)
echarts.use([
  BarChart, LineChart, PieChart, RadarChart, GaugeChart, HeatmapChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DataZoomComponent, RadarComponent, ToolboxComponent, GraphicComponent,
  CanvasRenderer,
]);

export type { EChartsType } from 'echarts/core';
export { echarts };

/**
 * useEcharts — ECharts 适配 hook
 * 移植自 soybean-admin,适配 BrewGuard:按需注册 + effectScope 自动销毁 + ResizeObserver + 暗色品牌色。
 * 用法:const { domRef, chart, setOptions } = useEcharts();
 */
export function useEcharts(dark = true) {
  const domRef = ref<HTMLElement | null>(null);
  const chart = shallowRef<echarts.ECharts | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  function init() {
    if (!domRef.value) return;
    chart.value = echarts.init(domRef.value, dark ? 'dark' : null, { renderer: 'canvas' });
    resizeObserver = new ResizeObserver(() => chart.value?.resize());
    resizeObserver.observe(domRef.value);
  }

  function setOptions(options: echarts.EChartsCoreOption, opts?: echarts.SetOptionOpts) {
    if (!chart.value) init();
    chart.value?.setOption(
      { color: ['#7cff67', '#4dabf7', '#ff6b6b', '#ffd43b', '#a78bfa'], ...options },
      opts
    );
  }

  function resize() { chart.value?.resize(); }
  function dispose() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    chart.value?.dispose();
    chart.value = null;
  }

  onScopeDispose(dispose);
  return { domRef, chart, setOptions, resize, dispose };
}

export default useEcharts;
