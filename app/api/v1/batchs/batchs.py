from fastapi import APIRouter, Query
from tortoise.expressions import Q

from app.controllers.batch import batch_controller
from app.schemas import Success, SuccessExtra
from app.schemas.batchs import *

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
