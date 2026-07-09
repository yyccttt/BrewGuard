import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { get, post, del } from '@/utils/http';
import { useForm } from './useForm';
import { useModal } from './useModal';

/**
 * useCrud — 通用列表/表单/弹窗 CRUD 逻辑封装
 *
 * 抽象自 BatchList/BatchDetail 中重复的 openCreate/openEdit/confirmDelete/submitForm/refresh。
 * 参考:vue-naive-admin/src/composables/useCrud.js (handleAdd/handleEdit/handleDelete/handleSave)
 *
 * 约定后端响应格式(http 拦截器已解包):
 *   - 列表: GET listUrl -> { data: T[], total, page, page_size }
 *   - 创建: POST createUrl(payload)
 *   - 更新: POST updateUrl(payload)
 *   - 删除: DELETE deleteUrl({ id })
 *
 * 用法:
 *   const crud = useCrud<Batch>({
 *     listUrl: '/batch/list',
 *     createUrl: '/batch/create',
 *     updateUrl: '/batch/update',
 *     deleteUrl: '/batch/delete',
 *     initForm: { batch_no: '', ... },
 *     // 可选:自定义列表查询参数构造、提交前的表单校验
 *     buildQuery: () => ({ batch_no: searchNo.value }),
 *     validate: (d) => d.batch_no ? null : '批次号必填',
 *     messages: { saveSuccess: t('admin.batch.saveSuccess'), deleteSuccess: t('admin.batch.deleteSuccess') }
 *   });
 *   crud.openCreate(); crud.openEdit(row); crud.confirmDelete(row);
 *   crud.refresh();
 */

export interface UseCrudOptions<T extends object> {
  listUrl: string;
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
  initForm: T;
  /** 列表查询参数(不含分页),默认空 */
  buildQuery?: () => Record<string, any>;
  /** 提交前的表单校验,返回错误信息字符串;返回 null 表示通过 */
  validate?: (data: T) => string | null;
  /** 操作成功/失败的提示文案 */
  messages?: {
    saveSuccess?: string;
    deleteSuccess?: string;
    saveError?: string;
    deleteError?: string;
    listError?: string;
  };
  /** 删除确认文案 */
  deleteConfirm?: {
    message?: string;
    header?: string;
  };
}

export function useCrud<T extends { id?: number }>(options: UseCrudOptions<T>) {
  const toast = useToast();
  const { t: _t } = useI18n();

  const {
    listUrl,
    createUrl,
    updateUrl,
    deleteUrl,
    initForm,
    buildQuery,
    validate,
    messages = {},
    deleteConfirm = {},
  } = options;

  // 列表状态
  const list = ref<T[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);

  // 表单 & 弹窗
  const form = useForm<T>({ ...initForm });
  const modal = useModal();
  const editing = ref(false);

  // toast 快捷封装
  function toastOk(detail: string) {
    toast.add({ severity: 'success', summary: 'OK', detail, life: 3000 });
  }
  function toastErr(detail: string) {
    toast.add({ severity: 'error', summary: 'Error', detail, life: 3000 });
  }

  // 刷新列表(沿用当前分页)
  async function refresh() {
    loading.value = true;
    try {
      const query = buildQuery ? buildQuery() : {};
      const res = await get<any>(listUrl, { page: page.value, page_size: pageSize.value, ...query });
      list.value = res.data || [];
      total.value = res.total || 0;
    } catch (e) {
      toastErr(messages.listError || (e as Error).message);
    } finally {
      loading.value = false;
    }
  }

  function onPage(event: any) {
    page.value = event.page + 1;
    pageSize.value = event.rows;
    refresh();
  }

  function openCreate() {
    editing.value = false;
    form.reset();
    modal.open();
  }

  function openEdit(row: T) {
    editing.value = true;
    // 编辑场景:把行数据作为初始值,reset 可回到该行数据
    form.setInitial(row);
    modal.open();
  }

  // 提交(创建/更新)
  async function submit() {
    // 校验
    if (validate) {
      const err = validate(form.data.value);
      if (err) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: err, life: 3000 });
        return;
      }
    }
    await modal.withLoading(async () => {
      try {
        if (editing.value && form.data.value.id != null) {
          await post(updateUrl, form.data.value);
        } else {
          await post(createUrl, form.data.value);
        }
        toastOk(messages.saveSuccess || '保存成功');
        modal.close();
        await refresh();
      } catch (e) {
        toastErr(messages.saveError || (e as Error).message);
        throw e;
      }
    });
  }

  // 删除(需配合 PrimeVue useConfirm,这里只暴露 deleteRow,确认逻辑由调用方编排)
  async function deleteRow(row: T) {
    try {
      await del(deleteUrl, { id: row.id });
      toastOk(messages.deleteSuccess || '删除成功');
      await refresh();
    } catch (e) {
      toastErr(messages.deleteError || (e as Error).message);
      throw e;
    }
  }

  return {
    // 列表
    list,
    loading,
    total,
    page,
    pageSize,
    refresh,
    onPage,
    // 表单 & 弹窗
    form,
    modal,
    editing,
    openCreate,
    openEdit,
    submit,
    deleteRow,
    // deleteConfirm 文案透传给调用方构造确认框
    deleteConfirm,
  };
}

export default useCrud;
