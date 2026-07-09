import os
import typing
import warnings

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    CORS_ORIGINS: typing.List = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: typing.List = ["*"]
    CORS_ALLOW_HEADERS: typing.List = ["*"]

    DEBUG: bool = True

    PROJECT_ROOT: str = _PROJECT_ROOT
    BASE_DIR: str = _BASE_DIR
    LOGS_ROOT: str = os.path.join(BASE_DIR, "app/logs")
    # 从环境变量读取;未配置时使用开发默认值并告警,避免启动报错
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 day
    TORTOISE_ORM: dict = {
        "connections": {
            # SQLite configuration
            "sqlite": {
                "engine": "tortoise.backends.sqlite",
                "credentials": {"file_path": f"{BASE_DIR}/db.sqlite3"},  # Path to SQLite database file
            },
            # MySQL/MariaDB configuration
            # Install with: tortoise-orm[asyncmy]
            # "mysql": {
            #     "engine": "tortoise.backends.mysql",
            #     "credentials": {
            #         "host": "localhost",  # Database host address
            #         "port": 3306,  # Database port
            #         "user": "yourusername",  # Database username
            #         "password": "yourpassword",  # Database password
            #         "database": "yourdatabase",  # Database name
            #     },
            # },
            # PostgreSQL configuration
            # Install with: tortoise-orm[asyncpg]
            # "postgres": {
            #     "engine": "tortoise.backends.asyncpg",
            #     "credentials": {
            #         "host": "localhost",  # Database host address
            #         "port": 5432,  # Database port
            #         "user": "yourusername",  # Database username
            #         "password": "yourpassword",  # Database password
            #         "database": "yourdatabase",  # Database name
            #     },
            # },
            # MSSQL/Oracle configuration
            # Install with: tortoise-orm[asyncodbc]
            # "oracle": {
            #     "engine": "tortoise.backends.asyncodbc",
            #     "credentials": {
            #         "host": "localhost",  # Database host address
            #         "port": 1433,  # Database port
            #         "user": "yourusername",  # Database username
            #         "password": "yourpassword",  # Database password
            #         "database": "yourdatabase",  # Database name
            #     },
            # },
            # SQLServer configuration
            # Install with: tortoise-orm[asyncodbc]
            # "sqlserver": {
            #     "engine": "tortoise.backends.asyncodbc",
            #     "credentials": {
            #         "host": "localhost",  # Database host address
            #         "port": 1433,  # Database port
            #         "user": "yourusername",  # Database username
            #         "password": "yourpassword",  # Database password
            #         "database": "yourdatabase",  # Database name
            #     },
            # },
        },
        "apps": {
            "models": {
                "models": ["app.models", "aerich.models"],
                "default_connection": "sqlite",
            },
        },
        "use_tz": False,  # Whether to use timezone-aware datetimes
        "timezone": "Asia/Shanghai",  # Timezone setting
    }
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# 启动时检查 SECRET_KEY:未配置则回退到开发默认值并告警,生产环境务必设置真实密钥
if not settings.SECRET_KEY:
    settings.SECRET_KEY = _DEV_DEFAULT_SECRET_KEY
    warnings.warn(
        "SECRET_KEY 未配置,已回退到内置开发默认值。请在 .env 文件或环境变量中设置 "
        "SECRET_KEY(可用 `openssl rand -hex 32` 生成),生产环境务必使用强随机密钥。",
        RuntimeWarning,
        stacklevel=1,
    )
