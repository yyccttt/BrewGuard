# BrewGuard
自己的毕设系统，酿酒检测系统

## 配置

项目敏感配置通过环境变量 / `.env` 文件管理，`.env` 已加入 `.gitignore`，不会提交到仓库。

1. 复制环境变量模板：

   ```bash
   cp .env.example .env
   ```

2. 生成并填写 `SECRET_KEY`（JWT 加密密钥）：

   ```bash
   # 生成一个 64 位十六进制随机串
   openssl rand -hex 32
   ```

   将结果填入 `.env`：

   ```env
   SECRET_KEY=你的随机密钥
   ```

3. 启动：若未配置 `SECRET_KEY`，应用会回退到内置开发默认值并在控制台告警；**生产环境务必设置强随机密钥**，切勿使用默认值。
