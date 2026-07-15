import os
import typing

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# 加载 .env(位于 app/.env)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))


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

    PROJECT_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    BASE_DIR: str = os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir))
    LOGS_ROOT: str = os.path.join(BASE_DIR, "app/logs")
    # SECRET_KEY 必须从环境变量读取，绝不硬编码到源码（企业级安全要求）
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-insecure-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 day
    TORTOISE_ORM: dict = {
        "connections": {
            # 生产环境通过 DATABASE_URL 环境变量切换 MySQL/PostgreSQL
            # 开发环境默认使用 SQLite（零配置）
            "default": _db_url if (_db_url := os.getenv("DATABASE_URL")) else f"sqlite://{BASE_DIR}/db.sqlite3",
        },
        "apps": {
            "models": {
                "models": ["app.models", "aerich.models"],
                "default_connection": "default",
            },
        },
        "use_tz": False,  # Whether to use timezone-aware datetimes
        "timezone": "Asia/Shanghai",  # Timezone setting
    }
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"


settings = Settings()
