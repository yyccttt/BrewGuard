from fastapi import APIRouter

from .stats import router

stats_router = APIRouter()
stats_router.include_router(router, tags=["统计模块"])

__all__ = ["stats_router"]
