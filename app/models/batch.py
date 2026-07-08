from tortoise import fields

from .base import BaseModel, TimestampMixin


class Batch(BaseModel, TimestampMixin):
    batch_no = fields.CharField(max_length=64, unique=True, description="批次编号", index=True)
    recipe = fields.CharField(max_length=100, null=True, description="配方/品种", index=True)
    status = fields.CharField(max_length=20, default="fermenting", description="批次状态", index=True)
    start_time = fields.DatetimeField(null=True, description="发酵开始时间", index=True)
    end_time = fields.DatetimeField(null=True, description="发酵结束时间")
    remark = fields.CharField(max_length=500, null=True, description="备注")
    is_deleted = fields.BooleanField(default=False, description="软删除标记", index=True)

    class Meta:
        table = "batch"
