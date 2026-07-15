<template>
  <div ref="domRef" class="echart-container" :style="{ height: height, width: '100%' }"></div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import type { EChartsCoreOption } from 'echarts/core';
import { useEcharts } from '@/composables/useEcharts';

/** ECharts 包装组件:传入 option 自动渲染,option 变化自动更新。 */
const props = withDefaults(defineProps<{
  option: EChartsCoreOption;
  height?: string;
  dark?: boolean;
}>(), {
  height: '300px',
  dark: true,
});

const { domRef, setOptions } = useEcharts(props.dark);

watch(
  () => props.option,
  (opt) => { if (opt) setOptions(opt, true); },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.echart-container { min-height: 200px; }
</style>
