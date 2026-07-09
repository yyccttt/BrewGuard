import { ref } from 'vue';

/**
 * useModal — 通用弹窗状态(visible + loading)
 * 适配 PrimeVue 的 Dialog(v-model:visible)与 footer 按钮的 loading 态。
 *
 * 参考:vue-naive-admin/src/composables/useModal.js (modalRef + okLoading)
 *
 * 用法:
 *   const modal = useModal();
 *   <Dialog v-model:visible="modal.visible.value" />
 *   <Button :loading="modal.loading.value" @click="submit" />
 *   modal.open(); modal.close(); modal.withLoading(async () => { ... });
 */
export function useModal() {
  const visible = ref(false);
  const loading = ref(false);

  function open() {
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  // 包裹一个异步操作,执行期间 loading=true,结束(无论成功失败)置回 false
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true;
    try {
      return await fn();
    } finally {
      loading.value = false;
    }
  }

  return { visible, loading, open, close, withLoading };
}

export default useModal;
