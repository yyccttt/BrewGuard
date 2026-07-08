from typing import Optional

from pydantic import BaseModel, Field


class BaseAlert(BaseModel):
    batch_id: int = Field(..., description="批次ID")
    detection_id: Optional[int] = Field(None, description="检测记录ID")
    metric: str = Field(..., description="异常指标")
    value: float = Field(..., description="实际值")
    threshold: float = Field(..., description="阈值")
    direction: str = Field(..., description="方向(high/low)")
    status: str = Field("open", description="状态")
    remark: str = Field("", description="备注")


class AlertCreate(BaseAlert):
    pass


class AlertUpdate(BaseModel):
    id: int
    status: str = Field(..., description="新状态")


class ThresholdConfig(BaseModel):
    """批次阈值配置"""
    temp_min: Optional[float] = Field(None, description="温度下限")
    temp_max: Optional[float] = Field(None, description="温度上限")
    ph_min: Optional[float] = Field(None, description="pH下限")
    ph_max: Optional[float] = Field(None, description="pH上限")
    abv_min: Optional[float] = Field(None, description="酒精度下限")
    abv_max: Optional[float] = Field(None, description="酒精度上限")
