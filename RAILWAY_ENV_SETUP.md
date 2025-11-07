# Railway 环境变量配置指南

## 🔐 必需的环境变量

复制以下内容到 Railway 的 Variables 页面：

### 1. 基础配置
```
NODE_ENV=production
PORT=3002
```

### 2. Supabase 数据库
```
SUPABASE_URL=你的_Supabase_URL
SUPABASE_ANON_KEY=你的_Supabase_匿名密钥
SUPABASE_SERVICE_KEY=你的_Supabase_服务密钥
```

### 3. TON 区块链
```
TON_API_KEY=你的_TON_API_密钥
TON_NETWORK=testnet
TON_API_ENDPOINT=https://testnet.toncenter.com/api/v2
```

### 4. JWT 安全
```
JWT_SECRET=你的_32位随机字符串
```

### 5. Telegram Bot（可选）
```
TELEGRAM_ADMIN_BOT_TOKEN=你的_Bot_Token
TELEGRAM_ADMIN_IDS=你的_Telegram_ID
TELEGRAM_CHANNEL_ID=你的_频道_ID
```

### 6. 功能开关
```
VITE_ENABLE_REDPACKET=true
VITE_ENABLE_OFFICIAL_RAIN=true
VITE_ENABLE_WHALE_TRACKING=true
```

### 7. CORS 配置
```
CORS_ORIGIN=https://你的域名.railway.app
```

## 📝 如何添加环境变量

1. 在 Railway 项目页面，点击 **Variables** 标签
2. 点击 **+ New Variable**
3. 输入变量名和值
4. 点击 **Add**
5. 重复以上步骤添加所有变量
6. 点击 **Deploy** 重新部署

## ⚠️ 重要提示

- 不要在环境变量中使用引号
- 确保所有必需的变量都已添加
- JWT_SECRET 必须至少 32 个字符
- 添加变量后需要重新部署

## 🔍 获取你的值

### Supabase
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击 Settings → API
4. 复制 URL 和 Keys

### TON API
1. 访问 https://toncenter.com
2. 注册账号
3. 获取 API Key

### Telegram Bot
1. 在 Telegram 搜索 @BotFather
2. 发送 /newbot 创建 Bot
3. 复制 Bot Token
