import os
import typing
import warnings

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# 加载项目根目录下的 .env 文件(若存在),本地开发用,生产环境用真实环境变量覆盖
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
_BASE_DIR = os.path.abspath(os.path.join(_PROJECT_ROOT, os.pardir))
load_dotenv(os.path.join(_BASE_DIR, ".env"))

# 开发环境兜底用的默认密钥,仅在未配置 SECRET_KEY 时使用并告警,请勿用于生产
_DEV_DEFAULT_SECRET_KEY = "3488a63e1765035d386f05409663f55c83bfae3b3c61a932744b20ad14244dcf"


class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    APP_TITLE: str = "BrewGuard"
    PROJECT_NAME: str = "BrewGuard 酿酒检测系统"
    APP_DESCRIPTION: str = "智能酿酒检测系统 - 实时监测发酵过程,数据驱动品质决策"

    CORS_ORIGINS: typing.List = ["http://localhost:5173", "http://127.0.0.1:5173"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: typing.List = ["*"]
    CORS_ALLOW_HEADERS: typing.List = ["*"]

    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    PROJECT_ROOT: str = _PROJECT_ROOT
    BASE_DIR: str = _BASE_DIR
    LOGS_ROOT: str = os.path.join(BASE_DIR, "app/logs")
    # 从环境变量读取;未配置时使用开发默认值并告警,避免启动报错
    SECRET_KEY: str = os.getenv("SECRET_KEY", "") or (_DEV_DEFAULT_SECRET_KEY if os.getenv("DEBUG", "true").lower() == "true" else "")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 day
    TORTOISE_ORM: dict = {
        "connections": {
            "default": _db_url if (_db_url := os.getenv("DATABASE_URL")) else f"sqlite://{BASE_DIR}/db.sqlite3",
        },
        "apps": {
            "models": {
                "models": ["app.models", "aerich.models"],
                "default_connection": "default",
            },
        },
        "use_tz": False,
        "timezone": "Asia/Shanghai",
    }
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"


if not Settings().SECRET_KEY:
    warnings.warn("SECRET_KEY is not set! Set it in .env for production.", RuntimeWarning, stacklevel=2)
    Settings.model_fields["SECRET_KEY"].default = _DEV_DEFAULT_SECRET_KEY

settings = Settings()
