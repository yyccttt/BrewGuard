const TOKEN_KEY = 'brewguard_token';

export function getToken(): string {
  const token = localStorage.getItem(TOKEN_KEY);
  // 开发模式:没有 token 时用 dev 后门直连(后端 token=dev 跳过鉴权)
  return token || 'dev';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isDevMode(): boolean {
  return getToken() === 'dev';
}
