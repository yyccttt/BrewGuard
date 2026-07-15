"""WebSocket 路由。

挂载在根级 ``/ws``(不走 /api/v1 前缀,因为 WS 不是 REST 资源)。
鉴权用 query 参数 ``?token=xxx`` —— 浏览器原生 WebSocket 无法设置请求头。

消息协议:
- 客户端发 {"type": "ping"} → 服务端回 {"type": "pong"}(心跳保活)
- 服务端主动推送的类型见 ws_manager 调用处:
  - {"type": "detection", ...}   新检测记录
  - {"type": "alert", ...}       新告警
"""
import json

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from app.core.ws_manager import manager
from app.log import logger
from app.models import User
from app.settings import settings

router = APIRouter()


async def _authenticate(token: str) -> int | None:
    """复用 JWT 鉴权逻辑,返回 user_id。失败返回 None。

    兼容开发后门 token=dev(取首个用户)。
    """
    try:
        if token == "dev":
            user = await User.filter().first()
            return user.id if user else None
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("user_id")
    except Exception:
        return None


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, token: str = ""):
    """WebSocket 主入口。

    连接时鉴权,失败直接关闭(code 4001)。
    鉴权通过后登记到连接池,循环接收消息(仅处理心跳)。
    业务推送由各路由通过 manager.broadcast 触发,不经过这里。
    """
    # 鉴权
    if not token:
        await ws.close(code=4001)
        return
    user_id = await _authenticate(token)
    if not user_id:
        await ws.close(code=4001)
        return

    await manager.connect(ws, user_id)

    try:
        while True:
            raw = await ws.receive_text()
            # 只处理心跳,业务消息暂不支持客户端→服务端
            try:
                msg = json.loads(raw)
                if msg.get("type") == "ping":
                    await manager.send_json(ws, {"type": "pong"})
            except (json.JSONDecodeError, AttributeError):
                pass
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.debug(f"WebSocket error: {e}")
    finally:
        # 确保连接关闭时从池中移除
        if ws.client_state != WebSocketState.DISCONNECTED:
            try:
                await ws.close()
            except Exception:
                pass
        manager.disconnect(ws, user_id)
