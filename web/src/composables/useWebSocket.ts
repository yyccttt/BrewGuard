/**
 * WebSocket composable —— BrewGuard 实时通信客户端
 *
 * 设计要点:
 * - 全局单例:多个组件调用 useWebSocket() 共享同一个连接,避免重复建连
 * - 自动重连:指数退避(1s→2s→4s→8s→16s),最多 5 次,超 5 次放弃
 * - 心跳保活:每 30s 发 ping,服务端回 pong;3 次没收到 pong 认定断连重连
 * - 按消息 type 分发:订阅者注册 (type, handler),收到对应消息时回调
 * - token 来自 utils/auth,与 HTTP 请求同源(后端用 token query 鉴权)
 *
 * 用法:
 *   const { on, off, status } = useWebSocket()
 *   on('alert', (alertData) => { ... })
 *   on('detection', (detectionData) => { ... })
 */
import { ref, onUnmounted } from 'vue'
import { getToken } from '@/utils/auth'

type WsStatus = 'connecting' | 'open' | 'closed'

interface WsMessage {
  type: string
  data?: any
}

type MessageHandler = (data: any) => void

// ===== 全局单例状态(模块级,所有 useWebSocket 调用共享) =====
let ws: WebSocket | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let missedPongs = 0
let manualClose = false

const status = ref<WsStatus>('closed')
const handlers = new Map<string, Set<MessageHandler>>()
// 记录已注册的组件卸载清理函数数量,用于判断是否还有活跃订阅
let activeSubscribers = 0

const MAX_RECONNECT = 5
const HEARTBEAT_INTERVAL = 30_000
const MAX_MISSED_PONGS = 3

function getWsUrl(): string {
  const token = getToken()
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws?token=${encodeURIComponent(token)}`
}

function clearTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  missedPongs = 0
  heartbeatTimer = setInterval(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    // 3 次没收到 pong,认定连接已死,主动关闭触发重连
    if (missedPongs >= MAX_MISSED_PONGS) {
      ws.close()
      return
    }
    ws.send(JSON.stringify({ type: 'ping' }))
    missedPongs++
  }, HEARTBEAT_INTERVAL)
}

function scheduleReconnect() {
  if (manualClose) return
  if (reconnectAttempts >= MAX_RECONNECT) return
  reconnectAttempts++
  // 指数退避:1s, 2s, 4s, 8s, 16s
  const delay = Math.pow(2, reconnectAttempts - 1) * 1000
  reconnectTimer = setTimeout(connect, delay)
}

function dispatch(msg: WsMessage) {
  // pong 是心跳响应,重置计数,不分发给业务
  if (msg.type === 'pong') {
    missedPongs = 0
    return
  }
  const set = handlers.get(msg.type)
  if (set) {
    set.forEach(handler => {
      try {
        handler(msg.data)
      } catch (e) {
        console.error('[WS handler error]', msg.type, e)
      }
    })
  }
}

function connect() {
  if (manualClose) return
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  status.value = 'connecting'
  try {
    ws = new WebSocket(getWsUrl())
  } catch (e) {
    console.error('[WS] connect failed', e)
    scheduleReconnect()
    return
  }

  ws.onopen = () => {
    reconnectAttempts = 0
    status.value = 'open'
    startHeartbeat()
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WsMessage
      dispatch(msg)
    } catch {
      // 非 JSON 消息忽略
    }
  }

  ws.onerror = (e) => {
    console.error('[WS] error', e)
  }

  ws.onclose = () => {
    status.value = 'closed'
    clearTimers()
    if (!manualClose) scheduleReconnect()
  }
}

/**
 * 订阅某类消息。返回取消订阅函数。
 * 传入的 handler 在组件卸载时会自动清理。
 */
function on(type: string, handler: MessageHandler): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set())
  handlers.get(type)!.add(handler)
  activeSubscribers++

  // 首次订阅时建连
  if (status.value === 'closed' && !manualClose) connect()

  return () => off(type, handler)
}

function off(type: string, handler: MessageHandler) {
  const set = handlers.get(type)
  if (set) {
    set.delete(handler)
    if (set.size === 0) handlers.delete(type)
  }
  activeSubscribers = Math.max(0, activeSubscribers - 1)

  // 没有订阅者了,且不在组件上下文,可考虑关闭连接(此处保留连接,由组件卸载逻辑控制)
}

/** 手动关闭连接(通常不需要手动调) */
function close() {
  manualClose = true
  clearTimers()
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }
  status.value = 'closed'
}

export function useWebSocket() {
  // 组件卸载时:若已无任何活跃订阅者,关闭连接释放资源
  onUnmounted(() => {
    activeSubscribers = Math.max(0, activeSubscribers - 1)
    if (activeSubscribers === 0) {
      manualClose = true
      clearTimers()
      if (ws) {
        ws.onclose = null
        ws.close()
        ws = null
      }
      status.value = 'closed'
      // 下次有订阅时允许重连
      manualClose = false
    }
  })

  return { status, on, off, close }
}
