import type { Directive } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * v-permission 按钮级权限指令
 *
 * 用法:
 *   <!-- 数组形式:拥有其中任意一项即放行 -->
 *   <Button v-permission="['batch:delete']" />
 *   <Button v-permission="['delete/api/v1/batch/delete']" />
 *
 *   <!-- 字符串形式:单个权限 -->
 *   <Button v-permission="'batch:create'" />
 *
 * 校验逻辑:
 *   - is_superuser 直接放行所有权限
 *   - 权限标识支持 method+path(如 "delete/api/v1/batch/delete")或简短形式(如 "batch:delete")
 *   - 无权限时从 DOM 移除元素(不隐藏,避免占位与可被绕过的样式恢复)
 *
 * 参考:naive-ui-admin/src/directives/permission.ts、vue-pure-admin/src/directives/perms/index.ts
 */

type PermissionValue = string | string[];

function hasAnyPermission(value: PermissionValue): boolean {
  const userStore = useUserStore();
  const perms = Array.isArray(value) ? value : [value];
  // 数组为空或未指定权限,放行(不限制)
  if (perms.length === 0) return true;
  return perms.some((p) => userStore.hasPermission(p));
}

export const permission: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    if (!hasAnyPermission(binding.value)) {
      // 无权限则从 DOM 移除,而非隐藏
      el.parentNode?.removeChild(el);
    }
  },
};

export default permission;
