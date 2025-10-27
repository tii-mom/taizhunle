# 部署指南 / Deployment Guide

## 前置要求 / Prerequisites

- Node.js 20+
- npm 或 yarn
- Supabase 账号
- Telegram Bot Token（可选）
- Vercel/Railway 账号（可选）

## 环境变量 / Environment Variables

复制 `.env.example` 到 `.env` 并填写：

```bash
cp .env.example .env
```

必填项：
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_KEY`: Supabase anon key
- `PORT`: 服务器端口（默认 3000）

可选项：
- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_CHANNEL_ID`: Telegram 频道 ID
- `TELEGRAM_ADMIN_IDS`: 管理员 Telegram ID（逗号分隔）

## 本地开发 / Local Development

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 本地 Supabase
npm run db:reset

# 或推送到远程
npm run db:push
```

### 3. 启动开发服务器

```bash
npm run dev
```

这将同时启动：
- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 生产部署 / Production Deployment

### 方案 1：Vercel（推荐前端）

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录并部署：
```bash
vercel login
npm run deploy
```

3. 在 Vercel Dashboard 设置环境变量

### 方案 2：Railway（推荐全栈）

1. 安装 Railway CLI：
```bash
npm i -g @railway/cli
```

2. 登录并部署：
```bash
railway login
railway up
```

3. 在 Railway Dashboard 设置环境变量

### 方案 3：Docker（自托管）

1. 构建镜像：
```bash
docker build -t redpacket-app .
```

2. 运行容器：
```bash
docker run -p 3000:3000 -p 5173:5173 --env-file .env redpacket-app
```

或使用 docker-compose：
```bash
docker-compose up -d
```

## 数据库迁移 / Database Migration

### Supabase 本地开发

```bash
# 启动本地 Supabase
npx supabase start

# 重置数据库
npm run db:reset

# 推送 schema
npm run db:push
```

### Supabase 生产环境

```bash
# 链接到远程项目
npx supabase link --project-ref your-project-ref

# 推送 schema
npm run db:push
```

## 定时任务 / Cron Jobs

后端包含以下定时任务：

- **价格调整**：每日 00:00（根据销量自动调价）
- **加速期**：每日 20:00 开始，00:00 结束（裂变系数 5% → 10%）
- **官方雨露**：每日 12:00, 14:00, 18:00, 22:00（生成新红包）

确保服务器持续运行以执行定时任务。

## Telegram Bot

### 设置步骤

1. 与 @BotFather 对话创建 Bot
2. 获取 Bot Token
3. 将 Token 设置到环境变量 `TELEGRAM_BOT_TOKEN`
4. 将 Bot 添加到频道并设置为管理员
5. 设置频道 ID 到 `TELEGRAM_CHANNEL_ID`

### 可用命令

- `/price` - 查看当前价格（仅管理员）
- `/accelerate` - 查看加速状态（仅管理员）
- `/soldout` - 查看销售状态
- `/next` - 查看下轮官方雨露时间

## 健康检查 / Health Check

```bash
curl http://localhost:3000/health
```

返回：
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## 故障排查 / Troubleshooting

### 前端无法连接后端

检查 CORS 配置和端口是否正确。

### 数据库连接失败

确认 Supabase URL 和 Key 正确，检查网络连接。

### Telegram Bot 无响应

确认 Token 正确，Bot 已添加到频道并有管理员权限。

### 定时任务未执行

确认服务器时区设置正确，检查日志输出。

## 监控 / Monitoring

建议使用以下工具监控应用：

- **Sentry**: 错误追踪
- **LogRocket**: 用户会话回放
- **Datadog**: 性能监控
- **Uptime Robot**: 可用性监控

## 备份 / Backup

定期备份 Supabase 数据库：

```bash
npx supabase db dump -f backup.sql
```

## 更新 / Updates

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建
npm run build

# 重启服务
pm2 restart all
```

## 支持 / Support

遇到问题？查看：
- [项目文档](./PROJECT_GUIDE.md)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Telegram 社区](https://t.me/your-channel)
