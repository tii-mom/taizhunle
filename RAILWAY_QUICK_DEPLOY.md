# 🚀 Railway 快速部署指南

## 步骤 1：在 Railway 创建新项目

1. 访问 https://railway.app/dashboard
2. 点击右上角 **"+ New"** → **"Deploy from GitHub repo"**
3. 选择仓库：**`tii-mom/taizhunleyuce`**
4. 选择分支：**`main`** 或 **`ai-experiment`**
5. 点击 **"Deploy Now"**

## 步骤 2：配置必需的环境变量

在 Railway 项目的 **Settings → Variables** 中添加以下环境变量：

### 🔴 必需变量（没有这些会启动失败）

```bash
# 数据库
SUPABASE_URL=你的supabase项目URL
SUPABASE_ANON_KEY=你的supabase匿名密钥
SUPABASE_SERVICE_KEY=你的supabase服务密钥
DATABASE_URL=你的postgresql连接字符串

# Telegram Bot
TELEGRAM_ADMIN_BOT_TOKEN=你的telegram_bot_token
TELEGRAM_ADMIN_IDS=你的telegram用户ID

# 服务器
NODE_ENV=production
PORT=3000

# 安全
SESSION_SECRET=随机生成的32位字符串
JWT_SECRET=随机生成的32位字符串

# TON 网络
TON_NETWORK=testnet
TON_API_ENDPOINT=https://testnet.toncenter.com/api/v2/
```

### 🟡 推荐变量（功能完整性）

```bash
# 业务配置
REDPACKET_PRICE_TON=9.99
ENABLE_MOCK_DATA=true

# 前端配置
VITE_API_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

## 步骤 3：等待部署完成

Railway 会自动：
1. 检测到 `railway.json` 和 `nixpacks.toml`
2. 安装依赖（包含 devDependencies）
3. 构建前端和后端
4. 启动服务

## 步骤 4：查看部署日志

- 点击 **Deployments** 标签
- 查看实时日志
- 如果失败，复制错误信息

## 🔧 如果部署失败

### 常见问题 1：缺少环境变量
**错误**：`Missing required environment variable: XXX`
**解决**：在 Settings → Variables 中添加缺失的变量

### 常见问题 2：构建失败
**错误**：`npm run build failed`
**解决**：检查是否使用了最新的代码（包含我们的修复）

### 常见问题 3：端口问题
**错误**：`Port 3000 is already in use`
**解决**：Railway 会自动分配端口，确保代码中使用 `process.env.PORT`

## 📝 验证部署成功

部署成功后，Railway 会提供一个公开 URL，类似：
```
https://your-project.up.railway.app
```

访问这个 URL，应该能看到你的应用！

## 🆘 需要帮助？

如果遇到问题，复制完整的部署日志发给我分析。
