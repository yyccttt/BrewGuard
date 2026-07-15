# BrewGuard 🍺 智能酿酒检测系统

> 数据驱动酿造,实时监测发酵过程。一个面向酿酒车间的全栈检测与管理平台(毕业设计)。

BrewGuard 覆盖从发酵批次管理、检测数据采集、阈值告警、实时推送,到车间投屏大屏、质检报告导出的完整链路,前后端均基于现代技术栈构建。

---

## ✨ 功能特性

| 模块 | 能力 |
|------|------|
| 🎨 **落地页** | 动效驱动的产品介绍页(Three.js / GSAP / WebGL 背景) |
| 📊 **仪表盘** | 批次/检测/告警概览,ECharts 趋势图 + 温度仪表盘 |
| 🏷️ **批次管理** | 发酵批次 CRUD + 阈值配置 + 生命周期流转(发酵中→已完成) |
| 🔬 **检测记录** | 检测数据录入 + 趋势可视化 + CSV/Excel 批量导入 |
| 🚨 **告警预警** | 自动阈值检测 + WebSocket 秒级推送 + 通知中心铃铛 |
| 🔔 **通知中心** | 顶栏铃铛 + 未读 Badge + 按级别分类,实时弹出 |
| ⚡ **WebSocket 实时通信** | 告警/检测数值实时推送,仪表盘数值实时跳动 |
| 🖥️ **车间投屏大屏** | `/screen` 全屏自适应大屏(三栏布局 + KPI 翻牌) |
| ⌨️ **命令面板** | Ctrl+K 全局搜索(菜单/批次号),全键盘操作 |
| 🛡️ **RBAC 权限** | 用户/角色/菜单/部门/API 五维权限 + 按钮级 `v-permission` |
| 📄 **报表导出** | 批次质检 PDF 报告 + Excel 数据导出(批次/检测/告警) |
| 🌓 **主题切换** | 暗色/亮色/跟随系统 |
| 📑 **多标签页** | 后台多页签导航 + KeepAlive |
| 🌍 **国际化** | 中/英双语 |
| 🤖 **AI 助手** | 集成 DeepSeek,酿酒知识问答 |

---

## 🛠️ 技术栈

### 前端
- **Vue 3.5** + TypeScript + Vite 6
- **PrimeVue 4** + Tailwind CSS(Geist 字体体系)
- **Pinia**(状态管理)/ **Vue Router 4**
- **ECharts 5**(趋势图/仪表盘/大屏)+ Chart.js(遗留)
- **@vueuse/core**(命令面板键盘/防抖)
- **vue-i18n**(中英双语)
- Three.js / GSAP / OGL(落地页动效)

### 后端
- **FastAPI** + **Tortoise ORM** + SQLite
- **JWT 鉴权** + RBAC(User↔Role↔Api 按 method+path 校验)
- **原生 WebSocket**(ConnectionManager 广播)
- **openpyxl**(Excel 导入导出)+ **aerich**(数据库迁移)
- **DeepSeek AI**(智能助手)

---

## 🚀 快速开始

### 环境要求
- **Python ≥ 3.11**(后端)
- **Node ≥ 18 / pnpm**(前端)

### 1. 克隆
```bash
git clone https://github.com/yyccttt/BrewGuard.git
cd BrewGuard
```

### 2. 后端启动
```bash
# 创建虚拟环境(Python 3.11+)
python -m venv .venv
# Windows: .venv\Scripts\activate  |  macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt

# 配置密钥(复制模板并填写)
cp .env.example .env
# 生成 SECRET_KEY:openssl rand -hex 32,填入 .env

python run.py          # 启动在 http://localhost:9999
```
> 首次启动自动建表并初始化超级管理员、菜单、角色。若未配置 `SECRET_KEY`,会回退开发默认值并告警。

### 3. 前端启动
```bash
cd web
pnpm install
pnpm dev               # 启动在 http://localhost:5173
```
> 前端通过 Vite 代理把 `/api` 与 `/ws` 转发到后端 9999 端口。

### 4. 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| `admin` | `123456` | 超级管理员(全部权限) |

---

## 📂 项目结构

```
BrewGuard/
├── app/                        # 后端(FastAPI)
│   ├── api/v1/                 # 路由层
│   │   ├── base/               # 登录/鉴权/用户信息
│   │   ├── batchs/             # 批次管理(+ 导出/结束发酵)
│   │   ├── detections/         # 检测记录(+ 导出/导入/模板)
│   │   ├── alerts/             # 告警(+ 导出)
│   │   ├── users|roles|menus|depts|apis/  # RBAC 五模块
│   │   ├── auditlog/           # 操作审计
│   │   ├── stats/              # 仪表盘统计
│   │   ├── ai/                 # DeepSeek 助手
│   │   └── ws/                 # WebSocket 端点
│   ├── controllers/            # 业务控制器
│   ├── core/                   # websocket 连接管理 / 依赖 / 中间件
│   ├── models/                 # Tortoise 模型(batch/detection/alert/admin)
│   ├── schemas/                # Pydantic 校验
│   ├── settings/               # 配置(.env)
│   └── utils/                  # export.py(Excel) / jwt / password
├── web/                        # 前端(Vue 3)
│   └── src/
│       ├── views/admin/        # 后台页面(Dashboard/BatchList/Alerts/System/Screen)
│       ├── views/screen/       # 车间投屏大屏
│       ├── composables/        # useCrud/useWebSocket/useEcharts/useScreenScale
│       ├── stores/             # user/theme/tab/notification
│       ├── components/common/  # NotificationBell/CommandPalette/EChart
│       └── i18n/               # 中英文案
└── run.py                      # 后端入口(uvicorn :9999)
```

---

## 📡 关键接口

启动后访问 [http://localhost:9999/docs](http://localhost:9999/docs) 查看 FastAPI 自动生成的完整 API 文档(Swagger UI)。

主要接口:
- `POST /api/v1/base/access_token` — 登录获取 token
- `GET /api/v1/stats/overview` / `trends` — 仪表盘数据
- `GET/POST /api/v1/batch/*` — 批次管理(+ `/finish` `/export`)
- `GET/POST /api/v1/detection/*` — 检测记录(+ `/import` `/template` `/export`)
- `WS /ws?token=xxx` — 实时通信(告警 + 检测数值推送)

---

## 🔑 配置说明

| 配置项 | 说明 | 默认 |
|--------|------|------|
| `SECRET_KEY` | JWT 加密密钥(.env) | 内置开发默认值(会告警) |
| `DEBUG` | 调试模式 | `True` |

> ⚠️ **生产环境务必在 `.env` 中设置强随机的 `SECRET_KEY`**,切勿使用默认值。

---

## 📄 License

MIT — 本项目为毕业设计作品。
