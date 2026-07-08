from fastapi import APIRouter, Query
from tortoise.expressions import Q

from app.controllers.alert import alert_controller
from app.schemas import Success, SuccessExtra
from app.schemas.alerts import *

router = APIRouter()


@router.get("/list", summary="查看告警列表")
async def list_alert(
    page: int = Query(1, description="页码"),
    page_size: int = Query(20, description="每页数量"),
    batch_id: int = Query(None, description="批次ID"),
    status: str = Query("", description="状态筛选"),
):
    q = Q(is_deleted=False)
    if batch_id:
        q &= Q(batch_id=batch_id)
    if status:
        q &= Q(status=status)
    total, objs = await alert_controller.list(page=page, page_size=page_size, search=q)
    data = [await obj.to_dict() for obj in objs]
    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/get", summary="查看告警")
async def get_alert(id: int = Query(..., description="告警ID")):
    obj = await alert_controller.get(id=id)
    return Success(data=await obj.to_dict())


@router.post("/acknowledge", summary="确认告警")
async def acknowledge_alert(alert_in: AlertUpdate):
    obj = await alert_controller.get(id=alert_in.id)
    obj.status = "acknowledged"
    await obj.save()
    return Success(msg="Acknowledged")


@router.post("/resolve", summary="解决告警")
async def resolve_alert(alert_in: AlertUpdate):
    obj = await alert_controller.get(id=alert_in.id)
    obj.status = "resolved"
    await obj.save()
    return Success(msg="Resolved")


@router.delete("/delete", summary="删除告警")
async def delete_alert(id: int = Query(..., description="告警ID")):
    obj = await alert_controller.get(id=id)
    obj.is_deleted = True
    await obj.save()
    return Success(msg="Deleted Successfully")
