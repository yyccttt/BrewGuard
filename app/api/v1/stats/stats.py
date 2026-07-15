from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Query
from tortoise.functions import Avg

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


@router.get("/trends", summary="仪表盘趋势数据(按小时聚合)")
async def stats_trends(
    hours: int = Query(24, ge=1, le=168, description="查询最近 N 小时的趋势数据"),
):
    """按小时聚合检测记录的平均温度/pH/酒精度,用于仪表盘折线图。

    返回每小时一个数据点;缺失的小时(无检测记录)用 null 占位,
    前端绘制折线图时自动断开,保持时间轴连续。
    在 Python 层聚合,避免不同数据库(SQLite/MySQL/PG)的 strftime 方言差异。
    """
    now = datetime.now()
    start = now - timedelta(hours=hours - 1)

    # 只取需要的字段,在内存按小时分桶
    rows = (
        await Detection.filter(is_deleted=False, created_at__gte=start)
        .values("created_at", "temperature", "ph", "abv")
    )

    # 累加每小时的数据
    buckets: dict[str, list] = defaultdict(lambda: {"temp": [], "ph": [], "abv": []})
    for row in rows:
        created = row["created_at"]
        if not created:
            continue
        key = created.replace(minute=0, second=0, microsecond=0)
        b = buckets[key]
        if row["temperature"] is not None:
            b["temp"].append(row["temperature"])
        if row["ph"] is not None:
            b["ph"].append(row["ph"])
        if row["abv"] is not None:
            b["abv"].append(row["abv"])

    def avg(lst):
        return round(sum(lst) / len(lst), 2) if lst else None

    # 构建连续时间轴(从 start 整点 到 当前小时)
    labels = []
    points = []
    cursor = start.replace(minute=0, second=0, microsecond=0)
    for _ in range(hours):
        b = buckets.get(cursor)
        if b:
            points.append({
                "temperature": round(avg(b["temp"]), 1) if avg(b["temp"]) is not None else None,
                "ph": avg(b["ph"]),
                "abv": round(avg(b["abv"]), 1) if avg(b["abv"]) is not None else None,
            })
        else:
            points.append({"temperature": None, "ph": None, "abv": None})
        labels.append(cursor.strftime("%H:00"))
        cursor += timedelta(hours=1)

    return Success(data={
        "labels": labels,
        "points": points,
    })
