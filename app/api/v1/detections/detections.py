from fastapi import APIRouter, Query
from tortoise.expressions import Q

from app.controllers.detection import detection_controller
from app.core.ws_manager import manager
from app.models.alerts import Alert
from app.models.batch import Batch
from app.schemas import Success, SuccessExtra
from app.schemas.detections import *

router = APIRouter()

# 默认阈值(批次未配置时使用)
DEFAULT_THRESHOLDS = {
    "temp_min": 18, "temp_max": 28,
    "ph_min": 3.5, "ph_max": 4.5,
    "abv_min": 0, "abv_max": 15,
}


async def check_and_alert(batch_id: int, detection_id: int, temperature, ph, abv):
    """检查检测值是否超阈值,超了则创建告警,并实时推送"""
    batch = await Batch.filter(id=batch_id).first()
    if not batch:
        return

    # 取批次阈值,未配置则用默认
    def threshold(field):
        val = getattr(batch, field, None)
        return val if val is not None else DEFAULT_THRESHOLDS[field]

    checks = [
        ("temperature", temperature, threshold("temp_min"), threshold("temp_max")),
        ("ph", ph, threshold("ph_min"), threshold("ph_max")),
        ("abv", abv, threshold("abv_min"), threshold("abv_max")),
    ]

    for metric, value, lo, hi in checks:
        if value is None:
            continue
        if value > hi:
            alert = await Alert.create(
                batch_id=batch_id, detection_id=detection_id, metric=metric,
                value=value, threshold=hi, direction="high", status="open"
            )
            await _push_alert(alert)
        elif value < lo:
            alert = await Alert.create(
                batch_id=batch_id, detection_id=detection_id, metric=metric,
                value=value, threshold=lo, direction="low", status="open"
            )
            await _push_alert(alert)


async def _push_alert(alert: Alert) -> None:
    """告警实时推送给所有在线客户端"""
    await manager.broadcast({
        "type": "alert",
        "data": await alert.to_dict(),
    })


async def _push_detection(obj, temperature, ph, abv) -> None:
    """新检测记录实时推送给所有在线客户端"""
    await manager.broadcast({
        "type": "detection",
        "data": {
            "id": obj.id,
            "batch_id": obj.batch_id,
            "temperature": temperature,
            "ph": ph,
            "abv": abv,
            "created_at": obj.created_at.strftime("%Y-%m-%d %H:%M:%S") if obj.created_at else None,
        },
    })


@router.get("/list", summary="查看检测记录列表")
async def list_detection(
    page: int = Query(1, description="页码"),
    page_size: int = Query(20, description="每页数量"),
    batch_id: int = Query(..., description="批次ID"),
):
    q = Q(is_deleted=False) & Q(batch_id=batch_id)
    total, objs = await detection_controller.list(page=page, page_size=page_size, search=q)
    data = [await obj.to_dict() for obj in objs]
    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/get", summary="查看检测记录")
async def get_detection(
    id: int = Query(..., description="检测记录ID"),
):
    obj = await detection_controller.get(id=id)
    data = await obj.to_dict()
    return Success(data=data)


@router.post("/create", summary="创建检测记录")
async def create_detection(detection_in: DetectionCreate):
    obj = await detection_controller.create(obj_in=detection_in)
    # 实时推送新检测数值
    await _push_detection(obj, detection_in.temperature, detection_in.ph, detection_in.abv)
    # 自动检查阈值并触发告警
    await check_and_alert(detection_in.batch_id, obj.id, detection_in.temperature, detection_in.ph, detection_in.abv)
    return Success(msg="Created Successfully")


@router.post("/update", summary="更新检测记录")
async def update_detection(detection_in: DetectionUpdate):
    await detection_controller.update(id=detection_in.id, obj_in=detection_in)
    return Success(msg="Updated Successfully")


@router.delete("/delete", summary="删除检测记录")
async def delete_detection(
    id: int = Query(..., description="检测记录ID"),
):
    obj = await detection_controller.get(id=id)
    obj.is_deleted = True
    await obj.save()
    return Success(msg="Deleted Successfully")
