# ===== 多阶段构建:前端构建 + 后端运行 =====

# --- 阶段 1: 前端构建 ---
FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY web/package.json web/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile
COPY web/ ./
RUN pnpm build

# --- 阶段 2: 后端运行 ---
FROM python:3.11-slim AS backend
WORKDIR /app

# 系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制后端代码
COPY app/ ./app/
COPY run.py pyproject.toml ./

# 复制前端构建产物
COPY --from=frontend-build /build/dist ./web/dist

# 环境变量默认值(可被 docker-compose / -e 覆盖)
ENV DEBUG=false
ENV SECRET_KEY=change-me-in-production
EXPOSE 9999

CMD ["python", "run.py"]
