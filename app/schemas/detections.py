from typing import Optional

from pydantic import BaseModel, Field


class BaseDetection(BaseModel):
    batch_id: int = Field(..., description="批次ID")
    temperature: Optional[float] = Field(None, description="温度(°C)", example=22.5)
    ph: Optional[float] = Field(None, description="pH值", example=4.2)
    abv: Optional[float] = Field(None, description="酒精度(%)", example=5.5)
    remark: str = Field("", description="备注")


class DetectionCreate(BaseDetection):
    pass


class DetectionUpdate(BaseDetection):
    id: int

    def update_dict(self):
        return self.model_dump(exclude_unset=True, exclude={"id"})
