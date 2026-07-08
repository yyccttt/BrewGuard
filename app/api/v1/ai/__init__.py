from fastapi import APIRouter

from .ai import router

ai_router = APIRouter()
ai_router.include_router(router, tags=["AI 助手模块"])

__all__ = ["ai_router"]
