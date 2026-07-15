import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 大屏自适应缩放 composable(参考 datav fullScreenContainer)
 * 设计稿 1920×1080,根据窗口实际尺寸等比缩放,监听 resize 实时更新。
 */
export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export function useScreenScale() {
  const scaleRef = ref(1);
  const screenRef = ref<HTMLElement | null>(null);

  function updateScale() {
    const sx = window.innerWidth / DESIGN_WIDTH;
    const sy = window.innerHeight / DESIGN_HEIGHT;
    scaleRef.value = Math.min(sx, sy);
  }

  onMounted(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
  });
  onUnmounted(() => window.removeEventListener('resize', updateScale));

  return { scaleRef, screenRef };
}
