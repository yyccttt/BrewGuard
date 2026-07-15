import axios from 'axios';
import { getToken } from './auth';

/**
 * 通用文件下载(带 token,处理 blob)
 * 用于 Excel 导出等需要鉴权的下载接口。
 * 用独立 axios 实例,不走响应拦截器的 JSON 解包。
 *
 * 用法:await downloadFile('/batch/export');
 */
export async function downloadFile(url: string, params?: Record<string, any>): Promise<void> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const res = await axios.get(baseURL + url, {
    params,
    responseType: 'blob',
    headers: { token: getToken() },
  });

  // 从 Content-Disposition 提取文件名,兜底用 url 推断
  const cd = res.headers['content-disposition'] || '';
  let filename = 'download.xlsx';
  const match = cd.match(/filename="?([^"]+)"?/);
  if (match) filename = decodeURIComponent(match[1]);

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export default downloadFile;
