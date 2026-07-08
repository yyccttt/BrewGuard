import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './auth';

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000
});

// 请求拦截:注入 token 头(后端用 token 字段而非 Authorization)
http.interceptors.request.use(
  config => {
    config.headers['token'] = getToken();
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截:解包 {code, msg, data}
http.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      console.error('[API Error]', res.msg || 'Unknown error');
      if (res.code === 401) {
        removeToken();
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res;
  },
  error => {
    console.error('[HTTP Error]', error.message);
    return Promise.reject(error);
  }
);

// 封装便捷方法,返回完整响应体 {code, msg, data, total?, page?, page_size?}
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.get(url, { params, ...config }).then(res => res as T);
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.post(url, data, config).then(res => res as T);
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.put(url, data, config).then(res => res as T);
}

export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return http.delete(url, { params, ...config }).then(res => res as T);
}

export default http;
