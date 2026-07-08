from fastapi import APIRouter

from .alerts import router

alerts_router = APIRouter()
alerts_router.include_router(router, tags=["告警模块"])

__all__ = ["alerts_router"]
