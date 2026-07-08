import { defineStore } from 'pinia';
import { ref } from 'vue';
import { post } from '@/utils/http';
import { getToken, setToken, removeToken } from '@/utils/auth';

interface UserInfo {
  id: number;
  username: string;
  is_superuser: boolean;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken());
  const userInfo = ref<UserInfo | null>(null);

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

  function logout() {
    token.value = '';
    userInfo.value = null;
    removeToken();
  }

  return { token, userInfo, login, fetchUserInfo, logout };
});
