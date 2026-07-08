from fastapi import APIRouter

from .detections import router

detections_router = APIRouter()
detections_router.include_router(router, tags=["检测记录模块"])

__all__ = ["detections_router"]
