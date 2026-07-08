from fastapi import APIRouter

from .batchs import router

batchs_router = APIRouter()
batchs_router.include_router(router, tags=["发酵批次模块"])

__all__ = ["batchs_router"]
