import { ref, onUnmounted, readonly } from 'vue';
import { getToken } from '@/utils/auth';

/**
 * WebSocket 连接 composable
 * 封装连接/自动重连(指数退避)/心跳/消息分发。
 * 参考源 vue-pure-admin mqtt-client.vue 的重连退避逻辑。
 * 消息协议(JSON):{ type: 'alert'|'detection'|'pong', payload }
 */
export type WsMessageHandler = (payload: any) => void;

const MAX_RETRIES = 5;
const BASE_DELAY = 2000;
const MAX_DELAY = 16000;
const HEARTBEAT_INTERVAL = 25000;

function wsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws?token=${encodeURIComponent(getToken())}`;
}

export function useWebSocket() {
  const connected = ref(false);
  const retryCount = ref(0);

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const handlers = new Map<string, Set<WsMessageHandler>>();

  function on(type: string, handler: WsMessageHandler) {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type)!.add(handler);
    return () => handlers.get(type)?.delete(handler);
  }

  function dispatch(msg: any) {
    if (!msg || !msg.type) return;
    const set = handlers.get(msg.type);
    if (set) set.forEach((h) => h(msg.payload));
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  function clearReconnectTimer() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  }

  function scheduleReconnect() {
    if (retryCount.value >= MAX_RETRIES) {
      console.warn('[WS] 重连次数已达上限,停止重连');
      return;
    }
    clearReconnectTimer();
    const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount.value), MAX_DELAY);
    retryCount.value += 1;
    console.log(`[WS] ${delay}ms 后第 ${retryCount.value} 次重连`);
    reconnectTimer = setTimeout(connect, delay);
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    try {
      ws = new WebSocket(wsUrl());
    } catch (e) {
      console.error('[WS] 创建连接失败', e);
      scheduleReconnect();
      return;
    }
    ws.onopen = () => {
      console.log('[WS] 已连接');
      connected.value = true;
      retryCount.value = 0;
      startHeartbeat();
    };
    ws.onmessage = (event) => {
      try { dispatch(JSON.parse(event.data)); } catch { /* 非 JSON 忽略 */ }
    };
    ws.onclose = (event) => {
      console.log('[WS] 连接关闭', event.code);
      connected.value = false;
      stopHeartbeat();
      if (event.code !== 1000 && event.code !== 1008) scheduleReconnect();
    };
    ws.onerror = (e) => console.error('[WS] 错误', e);
  }

  function disconnect() {
    clearReconnectTimer();
    stopHeartbeat();
    retryCount.value = MAX_RETRIES;
    if (ws) { ws.onclose = null; ws.close(1000, 'client disconnect'); ws = null; }
    connected.value = false;
  }

  onUnmounted(disconnect);

  return { connected: readonly(connected), retryCount: readonly(retryCount), connect, disconnect, on };
}

// 全局单例:整个应用共享一个 WS 连接
let _singleton: ReturnType<typeof useWebSocket> | null = null;
export function useSharedWebSocket() {
  if (!_singleton) {
    _singleton = useWebSocket();
    _singleton.connect();
  }
  return _singleton;
}
