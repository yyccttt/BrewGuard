import { ref, type Ref } from 'vue';

/**
 * useForm — 表单 model + 初始值 + reset + 校验
 *
 * 参考:vue-naive-admin/src/composables/useForm.js (formRef + formModel + validation)
 *
 * 用法:
 *   const form = useForm({ name: '', age: 0 });
 *   form.data.value.name = 'x';        // 双向绑定
 *   form.reset();                       // 重置为初始值
 *   // 校验:传入校验器,返回错误信息字符串;返回值非空表示校验失败
 *   const err = form.validate((d) => d.name ? null : '姓名必填');
 *   if (err) { ... }
 *   form.setInitial({ name: 'new' });   // 编辑场景:把当前数据设为初始值再填充
 */
export interface UseFormReturn<T extends object> {
  data: Ref<T>;
  reset: () => void;
  setInitial: (initial: Partial<T>) => void;
  fill: (values: Partial<T>) => void;
  validate: (validator: (data: T) => string | null) => string | null;
}

export function useForm<T extends object>(initial: T): UseFormReturn<T> {
  // 当前初始值(可被 setInitial 覆盖,用于编辑回填场景)
  let initialData: T = { ...initial };
  const data = ref<T>({ ...initial }) as Ref<T>;

  function reset() {
    data.value = { ...initialData };
  }

  // 更新初始值并重置(编辑场景:加载详情后调用)
  function setInitial(initial: Partial<T>) {
    initialData = { ...initialData, ...initial };
    data.value = { ...initialData };
  }

  function fill(values: Partial<T>) {
    data.value = { ...data.value, ...values };
  }

  function validate(validator: (data: T) => string | null): string | null {
    return validator(data.value);
  }

  return { data, reset, setInitial, fill, validate };
}

export default useForm;
