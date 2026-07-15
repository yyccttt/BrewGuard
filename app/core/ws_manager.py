"""WebSocket 连接管理器。

负责维护在线连接、广播消息。业务层通过 ``manager.broadcast`` 推送实时数据,
不直接操作 WebSocket 实例。

设计要点:
- 每个连接绑定 user_id,便于后续按角色/部门分组推送
- broadcast 捕获单连接异常,避免一个坏连接影响其他客户端
- 提供 send_to_user 定向推送(预留给通知中心)
"""
import json
from typing import Any

from fastapi import WebSocket

from app.log import logger


class ConnectionManager:
    """WebSocket 连接池,全局单例。"""

    def __init__(self) -> None:
        # active_connections: {user_id: [websocket, ...]} 一个用户可能多端登录
        self.active: dict[int, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: int) -> None:
        """接受连接并登记到连接池。"""
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)
        logger.info(f"WebSocket connected: user_id={user_id}, online={self.online_count}")

    def disconnect(self, ws: WebSocket, user_id: int) -> None:
        """从连接池移除指定连接。"""
        conns = self.active.get(user_id)
        if not conns:
            return
        if ws in conns:
            conns.remove(ws)
        if not conns:
            self.active.pop(user_id, None)
        logger.info(f"WebSocket disconnected: user_id={user_id}, online={self.online_count}")

    async def send_json(self, ws: WebSocket, data: Any) -> None:
        """向单个连接发送 JSON,失败静默(连接可能已断)。"""
        try:
            await ws.send_text(json.dumps(data, default=str, ensure_ascii=False))
        except Exception as e:
            logger.debug(f"WebSocket send failed: {e}")

    async def send_to_user(self, user_id: int, data: Any) -> None:
        """定向推送给某用户的所有活跃连接。"""
        conns = self.active.get(user_id, [])
        for ws in list(conns):
            await self.send_json(ws, data)

    async def broadcast(self, data: Any) -> None:
        """广播给所有在线连接。单连接异常不影响其他。"""
        msg = json.dumps(data, default=str, ensure_ascii=False)
        for user_id, conns in list(self.active.items()):
            for ws in list(conns):
                try:
                    await ws.send_text(msg)
                except Exception as e:
                    logger.debug(f"Broadcast to user_id={user_id} failed: {e}")
                    self.disconnect(ws, user_id)

    @property
    def online_count(self) -> int:
        """在线连接总数。"""
        return sum(len(v) for v in self.active.values())


# 全局单例,业务层直接 import 使用
manager = ConnectionManager()
