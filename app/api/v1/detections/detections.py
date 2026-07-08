from fastapi import APIRouter, Query
from tortoise.expressions import Q

from app.controllers.detection import detection_controller
from app.schemas import Success, SuccessExtra
from app.schemas.detections import *

router = APIRouter()


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
    await detection_controller.create(obj_in=detection_in)
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
