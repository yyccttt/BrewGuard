import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { get, post } from '@/utils/http';
import { getToken, setToken, removeToken } from '@/utils/auth';

interface UserInfo {
  id: number;
  username: string;
  is_superuser: boolean;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken());
  const userInfo = ref<UserInfo | null>(null);
  // 当前用户拥有的权限集合(来源 /base/userapi,格式为 method+path,如 "get/api/v1/batch/list")
  const permissions = ref<string[]>([]);

  const isSuperuser = computed(() => !!userInfo.value?.is_superuser);

  async function login(username: string, password: string) {
    const res = await post<any>('/base/access_token', { username, password });
    if (res.data?.access_token) {
      token.value = res.data.access_token;
      setToken(res.data.access_token);
    }
    return res;
  }

  async function fetchUserInfo() {
    const res = await post<any>('/base/userinfo');
    if (res.data) {
      userInfo.value = res.data;
    }
    return res;
  }

  // 拉取当前用户拥有的 API 权限列表,供 v-permission 指令校验
  async function fetchPermissions() {
    try {
      const res = await get<any>('/base/userapi');
      permissions.value = Array.isArray(res.data) ? res.data : [];
    } catch {
      permissions.value = [];
    }
  }

  // 校验是否拥有某项权限。权限标识支持两种形式:
  // 1. method+path 形式(如 "delete/api/v1/batch/delete"),直接匹配 userapi 返回值
  // 2. 简短标识(如 "batch:delete"),自动展开为匹配 batch 相关的增删改 API
  function hasPermission(perm: string): boolean {
    if (isSuperuser.value) return true;
    if (!perm) return false;
    const perms = permissions.value;
    if (perms.includes(perm)) return true;
    // 简短标识兼容:batch:delete -> 匹配任意 method+path 中 path 含 batch 且 method 为 delete
    if (perm.includes(':')) {
      const [moduleKey, action] = perm.split(':');
      const methodMap: Record<string, string[]> = {
        delete: ['delete'],
        create: ['post'],
        add: ['post'],
        update: ['put', 'patch', 'post'],
        edit: ['put', 'patch', 'post'],
        view: ['get'],
        list: ['get'],
      };
      const methods = methodMap[action?.toLowerCase()] || [];
      return perms.some((p) => {
        const m = p.match(/^([a-z]+)(.*)$/);
        if (!m) return false;
        const [, method, path] = m;
        return methods.includes(method) && path.toLowerCase().includes(`/${moduleKey}/`);
      });
    }
    return false;
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    permissions.value = [];
    removeToken();
  }

  return { token, userInfo, permissions, isSuperuser, login, fetchUserInfo, fetchPermissions, hasPermission, logout };
});
