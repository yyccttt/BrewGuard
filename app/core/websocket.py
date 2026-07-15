"""WebSocket 连接管理器

维护在线连接池,支持广播。用于告警推送和检测数值实时刷新。
"""
import json
import logging
from typing import List, Optional

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket 连接池管理器(单例)"""

    def __init__(self):
        self._connections: List[dict] = []

    async def connect(self, ws: WebSocket, user_id: int):
        await ws.accept()
        self._connections.append({"ws": ws, "user_id": user_id})
        logger.info(f"[WS] 用户 {user_id} 已连接,当前在线 {len(self._connections)}")

    def disconnect(self, ws: WebSocket):
        self._connections = [c for c in self._connections if c["ws"] is not ws]
        logger.info(f"[WS] 连接断开,当前在线 {len(self._connections)}")

    async def send_json(self, ws: WebSocket, data: dict):
        try:
            await ws.send_text(json.dumps(data, ensure_ascii=False, default=str))
        except Exception as e:
            logger.warning(f"[WS] 发送失败: {e}")
            self.disconnect(ws)

    async def broadcast_json(self, data: dict, exclude_user_id: Optional[int] = None):
        """向所有在线连接广播。消息格式:{ type, payload }"""
        text = json.dumps(data, ensure_ascii=False, default=str)
        dead = []
        for conn in list(self._connections):
            if exclude_user_id is not None and conn["user_id"] == exclude_user_id:
                continue
            try:
                await conn["ws"].send_text(text)
            except Exception as e:
                logger.warning(f"[WS] 广播失败: {e}")
                dead.append(conn)
        if dead:
            for conn in dead:
                self.disconnect(conn["ws"])

    @property
    def online_count(self) -> int:
        return len(self._connections)


# 全局单例
manager = ConnectionManager()
