from tortoise import fields

from .base import BaseModel, TimestampMixin


class Alert(BaseModel, TimestampMixin):
    batch_id = fields.IntField(description="批次ID", index=True)
    detection_id = fields.IntField(null=True, description="检测记录ID", index=True)
    metric = fields.CharField(max_length=20, description="异常指标(temperature/ph/abv)", index=True)
    value = fields.FloatField(description="实际值")
    threshold = fields.FloatField(description="阈值")
    direction = fields.CharField(max_length=10, description="方向(high/low)")
    status = fields.CharField(max_length=20, default="open", description="状态(open/acknowledged/resolved)", index=True)
    remark = fields.CharField(max_length=500, null=True, description="备注")
    is_deleted = fields.BooleanField(default=False, description="软删除标记", index=True)

    class Meta:
        table = "alert"
