from tortoise import fields

from .base import BaseModel, TimestampMixin


class Detection(BaseModel, TimestampMixin):
    batch_id = fields.IntField(description="批次ID", index=True)
    temperature = fields.FloatField(null=True, description="温度(°C)")
    ph = fields.FloatField(null=True, description="pH值")
    abv = fields.FloatField(null=True, description="酒精度(%)")
    remark = fields.CharField(max_length=500, null=True, description="备注")
    is_deleted = fields.BooleanField(default=False, description="软删除标记", index=True)

    class Meta:
        table = "detection"
