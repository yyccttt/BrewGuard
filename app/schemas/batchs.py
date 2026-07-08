from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BaseBatch(BaseModel):
    batch_no: str = Field(..., description="批次编号", example="B20260708001")
    recipe: str = Field("", description="配方/品种", example="黑啤A")
    status: str = Field("fermenting", description="批次状态")
    start_time: Optional[datetime] = Field(None, description="发酵开始时间")
    end_time: Optional[datetime] = Field(None, description="发酵结束时间")
    remark: str = Field("", description="备注")


class BatchCreate(BaseBatch):
    pass


class BatchUpdate(BaseBatch):
    id: int

    def update_dict(self):
        return self.model_dump(exclude_unset=True, exclude={"id"})
