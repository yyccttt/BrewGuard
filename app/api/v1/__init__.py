from fastapi import APIRouter

from app.core.dependency import DependPermission

from .ai import ai_router
from .apis import apis_router
from .auditlog import auditlog_router
from .base import base_router
from .batchs import batchs_router
from .depts import depts_router
from .detections import detections_router
from .menus import menus_router
from .roles import roles_router
from .stats import stats_router
from .users import users_router

v1_router = APIRouter()

v1_router.include_router(base_router, prefix="/base")
v1_router.include_router(ai_router, prefix="/ai")
v1_router.include_router(users_router, prefix="/user", dependencies=[DependPermission])
v1_router.include_router(roles_router, prefix="/role", dependencies=[DependPermission])
v1_router.include_router(menus_router, prefix="/menu", dependencies=[DependPermission])
v1_router.include_router(apis_router, prefix="/api", dependencies=[DependPermission])
v1_router.include_router(depts_router, prefix="/dept", dependencies=[DependPermission])
v1_router.include_router(batchs_router, prefix="/batch", dependencies=[DependPermission])
v1_router.include_router(detections_router, prefix="/detection", dependencies=[DependPermission])
v1_router.include_router(stats_router, prefix="/stats", dependencies=[DependPermission])
v1_router.include_router(auditlog_router, prefix="/auditlog", dependencies=[DependPermission])
