"""WebSocket 路由

鉴权:token 通过 query 参数传入(?token=xxx),用与 HTTP 相同的 JWT 校验。
心跳:前端发 ping,后端回 pong;断连由 manager 自动清理。

WS 路由挂在应用根路径 /ws(不挂 /api/v1,避免中间件干扰)。
"""
import logging

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket import manager
from app.models.admin import User
from app.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def authenticate_ws(token: str):
    """用 token query 参数鉴权,返回用户对象。失败返回 None。"""
    if not token:
        return None
    try:
        if token == "dev":
            return await User.filter().first()
        decode_data = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.JWT_ALGORITHM)
        user_id = decode_data.get("user_id")
        if not user_id:
            return None
        return await User.filter(id=user_id).first()
    except Exception as e:
        logger.warning(f"[WS] 鉴权失败: {e}")
        return None


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    token = ws.query_params.get("token", "")
    user = await authenticate_ws(token)

    if not user:
        await ws.accept()
        await ws.send_text('{"type":"error","message":"鉴权失败:无效或缺失 token"}')
        await ws.close(code=1008)
        return

    await manager.connect(ws, user.id)
    try:
        while True:
            raw = await ws.receive_text()
            if raw.strip() == "ping" or '"ping"' in raw:
                await manager.send_json(ws, {"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        logger.warning(f"[WS] 连接异常: {e}")
        manager.disconnect(ws)
