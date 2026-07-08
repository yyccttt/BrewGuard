from fastapi import APIRouter

from app.models.alerts import Alert
from app.models.batch import Batch
from app.models.detection import Detection
from app.schemas import Success

router = APIRouter()


@router.get("/overview", summary="仪表盘概览统计")
async def stats_overview():
    # 批次统计(排除软删除)
    batch_total = await Batch.filter(is_deleted=False).count()
    batch_abnormal = await Batch.filter(is_deleted=False, status="abnormal").count()
    batch_fermenting = await Batch.filter(is_deleted=False, status="fermenting").count()
    batch_completed = await Batch.filter(is_deleted=False, status="completed").count()

    # 检测记录统计
    detection_total = await Detection.filter(is_deleted=False).count()

    # 告警统计
    alert_open = await Alert.filter(is_deleted=False, status="open").count()

    # 平均温度(Tortoise annotate + Avg)
    from tortoise.functions import Avg
    avg_temp_result = await Detection.filter(is_deleted=False).annotate(avg_temp=Avg("temperature")).first()
    avg_temperature = round(avg_temp_result.avg_temp, 1) if avg_temp_result and avg_temp_result.avg_temp else 0

    return Success(data={
        "batch_total": batch_total,
        "batch_abnormal": batch_abnormal,
        "batch_fermenting": batch_fermenting,
        "batch_completed": batch_completed,
        "detection_total": detection_total,
        "avg_temperature": avg_temperature,
        "alert_open": alert_open,
        "status_distribution": {
            "fermenting": batch_fermenting,
            "completed": batch_completed,
            "abnormal": batch_abnormal
        }
    })
