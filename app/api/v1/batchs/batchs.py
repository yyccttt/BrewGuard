from fastapi import APIRouter, Query
from tortoise.expressions import Q

from app.controllers.batch import batch_controller
from app.models.batch import Batch
from app.schemas import Success, SuccessExtra
from app.schemas.batchs import *
from app.utils.export import export_to_excel

router = APIRouter()


@router.get("/list", summary="查看批次列表")
async def list_batch(
    page: int = Query(1, description="页码"),
    page_size: int = Query(20, description="每页数量"),
    batch_no: str = Query("", description="批次编号"),
):
    q = Q(is_deleted=False)
    if batch_no:
        q &= Q(batch_no__contains=batch_no)
    total, objs = await batch_controller.list(page=page, page_size=page_size, search=q)
    data = [await obj.to_dict() for obj in objs]
    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/get", summary="查看批次")
async def get_batch(
    id: int = Query(..., description="批次ID"),
):
    batch_obj = await batch_controller.get(id=id)
    data = await batch_obj.to_dict()
    return Success(data=data)


@router.post("/create", summary="创建批次")
async def create_batch(batch_in: BatchCreate):
    await batch_controller.create(obj_in=batch_in)
    return Success(msg="Created Successfully")


@router.post("/update", summary="更新批次")
async def update_batch(batch_in: BatchUpdate):
    await batch_controller.update(id=batch_in.id, obj_in=batch_in)
    return Success(msg="Updated Successfully")


@router.delete("/delete", summary="删除批次")
async def delete_batch(
    id: int = Query(..., description="批次ID"),
):
    obj = await batch_controller.get(id=id)
    obj.is_deleted = True
    await obj.save()
    return Success(msg="Deleted Successfully")


@router.post("/finish", summary="结束发酵(状态流转为 completed)")
async def finish_batch(
    id: int = Query(..., description="批次ID"),
):
    """将批次状态置为 completed 并自动填充 end_time(#43 批次生命周期)"""
    from datetime import datetime
    obj = await batch_controller.get(id=id)
    obj.status = "completed"
    obj.end_time = datetime.now()
    await obj.save()
    return Success(msg="批次已结束")


@router.get("/export", summary="导出批次列表 Excel")
async def export_batch():
    """导出全部未删除批次为 Excel(#40)"""
    objs = await Batch.filter(is_deleted=False).order_by("-created_at")
    rows = [await obj.to_dict() for obj in objs]
    columns = [
        ("batch_no", "批次编号"), ("recipe", "配方"), ("status", "状态"),
        ("start_time", "开始时间"), ("end_time", "结束时间"), ("remark", "备注"),
        ("temp_min", "温度下限"), ("temp_max", "温度上限"),
        ("ph_min", "pH下限"), ("ph_max", "pH上限"),
        ("abv_min", "酒精度下限"), ("abv_max", "酒精度上限"),
    ]
    return export_to_excel(columns, rows, "batch_export")
