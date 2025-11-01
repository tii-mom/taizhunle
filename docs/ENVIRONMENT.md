# 🔧 环境变量配置指南

## 📋 快速开始

### 1. 自动配置 (推荐)
```bash
npm run setup
```
运行交互式配置向导，自动生成 `.env` 文件。

### 2. 手动配置
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 3. 验证配置
```bash
npm run env:validate
```

## 📊 必需配置项

### 数据库 (Supabase)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取方式:**
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 在 Settings > API 中找到 URL 和 Keys

### Telegram Bot
```env
TELEGRAM_ADMIN_BOT_TOKEN=7123456789:AAEhBOweik6ad2y_FJpQqNdKEBNiCs8c4ec
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_ADMIN_IDS=123456789,987654321
```

**获取方式:**
1. 与 [@BotFather](https://t.me/BotFather) 对话创建 Bot
2. 获取 Bot Token
3. 将 Bot 添加到频道，获取频道 ID
4. 获取管理员的 Telegram ID

### TON 区块链
```env
TON_API_KEY=your-ton-api-key
TON_NETWORK=testnet
```

**获取方式:**
1. 与 [@tonapibot](https://t.me/tonapibot) 对话
2. 获取免费 API Key
3. 开发阶段使用 `testnet`，生产使用 `mainnet`

### 安全密钥
```env
JWT_SECRET=your-64-char-jwt-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key
```

**生成方式:**
```bash
# 生成 JWT 密钥 (64位)
openssl rand -base64 48

# 生成加密密钥 (32位)
openssl rand -base64 24
```

## 🎯 业务配置

### 红包销售
```env
# 价格配置
REDPACKET_PRICE_TON=9.99              # 红包价格 (TON)
REDPACKET_BASE_AMOUNT=10000           # 基础金额 (TAI)
REDPACKET_MAX_AMOUNT=200000           # 最大金额 (TAI)

# 裂变系数
REDPACKET_ACCELERATE_RATE_NORMAL=0.05 # 正常时期 5%
REDPACKET_ACCELERATE_RATE_BOOST=0.10  # 加速时期 10%

# 售罄阈值
REDPACKET_SOLDOUT_THRESHOLD=8000000000 # 80亿 TAI
```

### 官方雨露
```env
OFFICIAL_RAIN_AMOUNT=10000000         # 每份金额 (1000万 TAI)
OFFICIAL_RAIN_TOTAL_SHARES=60         # 总份数
OFFICIAL_RAIN_TICKET_PRICE=0.3        # 门票价格 (TON)
OFFICIAL_RAIN_MIN_BONUS=5000          # 最小随机奖励
OFFICIAL_RAIN_MAX_BONUS=100000        # 最大随机奖励
```

### 预测市场
```env
PREDICTION_MIN_POOL=1000000           # 最小奖池 (100万 TAI)
PREDICTION_FEE_RATE=0.05              # 手续费率 5%
PREDICTION_CREATOR_FEE=0.015          # 创建者分成 1.5%
PREDICTION_REFERRAL_FEE=0.015         # 邀请奖励 1.5%
PREDICTION_PLATFORM_FEE=0.02          # 平台分成 2%
```

## 🔐 安全配置

### API 限流
```env
RATE_LIMIT_WINDOW_MS=3600000          # 时间窗口 (1小时)
RATE_LIMIT_MAX_REQUESTS=100           # 最大请求数
RATE_LIMIT_IP_MAX=3                   # 单IP最大请求数
```

### 防刷机制
```env
MAX_DAILY_CLAIMS_PER_WALLET=5         # 每日最大领取次数
MAX_TOTAL_CLAIMS_PER_WALLET=100000    # 总计最大领取金额
BLACKLIST_CHECK_ENABLED=true          # 启用黑名单检查
```

## 🚀 部署配置

### 开发环境
```env
NODE_ENV=development
PORT=3000
ENABLE_MOCK_DATA=true                 # 启用模拟数据
VERBOSE_LOGGING=true                  # 详细日志
```

### 生产环境
```env
NODE_ENV=production
PORT=3000
ENABLE_MOCK_DATA=false                # 禁用模拟数据
LOG_LEVEL=info                        # 生产日志级别
```

### 测试环境
```env
NODE_ENV=test
TEST_DATABASE_URL=postgresql://...    # 测试数据库
ENABLE_MOCK_DATA=true                 # 测试使用模拟数据
```

## 🔄 定时任务配置

```env
# 任务开关
ENABLE_PRICE_ADJUSTMENT=true          # 价格调整任务
ENABLE_ACCELERATE_PERIOD=true         # 加速期任务
ENABLE_OFFICIAL_RAIN_CREATION=true    # 官方雨露生成任务

# 任务配置
CRON_TIMEZONE=Asia/Shanghai           # 时区
CRON_MAX_RETRIES=3                    # 最大重试次数
CRON_RETRY_DELAY=5000                 # 重试延迟 (毫秒)
```

## 📱 前端配置

```env
# 主题配置
VITE_DEFAULT_THEME=dark               # 默认主题
VITE_ENABLE_THEME_SWITCH=true         # 启用主题切换

# 功能开关
VITE_ENABLE_REDPACKET=true            # 红包功能
VITE_ENABLE_OFFICIAL_RAIN=true        # 官方雨露
VITE_ENABLE_USER_PREDICTION=true      # 用户创建预测
VITE_ENABLE_APPEAL_SYSTEM=true        # 申诉系统

# API 端点
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000       # WebSocket 地址
```

## 🛠️ 开发工具配置

```env
# 调试配置
DEBUG=taizhunle:*                     # 调试命名空间
VERBOSE_LOGGING=true                  # 详细日志
REACT_DEVTOOLS=true                   # React 开发工具

# 热重载
VITE_HMR_PORT=24678                   # HMR 端口
VITE_HMR_HOST=localhost               # HMR 主机
```

## 📊 监控配置

```env
# 错误追踪
SENTRY_DSN=https://your-sentry-dsn    # Sentry DSN

# 性能监控
DATADOG_API_KEY=your-datadog-key      # Datadog API Key

# 健康检查
HEALTH_CHECK_INTERVAL=30000           # 检查间隔 (毫秒)
HEALTH_CHECK_TIMEOUT=5000             # 超时时间 (毫秒)
```

## ⚠️ 注意事项

### 安全提醒
1. **永远不要提交 `.env` 文件到 Git**
2. **生产环境使用强密码和随机密钥**
3. **定期轮换 API 密钥和访问令牌**
4. **限制数据库和 API 的访问权限**

### 环境隔离
- **开发环境**: 使用测试网和模拟数据
- **测试环境**: 使用独立的测试数据库
- **生产环境**: 使用主网和真实数据

### 备份策略
- **定期备份环境变量配置**
- **使用密钥管理服务 (如 AWS Secrets Manager)**
- **为关键配置设置监控告警**

## 🆘 故障排查

### 常见问题

#### 1. Supabase 连接失败
```bash
# 检查 URL 和 Key 是否正确
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

#### 2. Telegram Bot 无响应
```bash
# 检查 Bot Token 是否有效
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"
```

#### 3. TON API 调用失败
```bash
# 检查 API Key 是否有效
curl -H "X-API-Key: YOUR_API_KEY" "https://testnet.toncenter.com/api/v2/getAddressInformation?address=EQD..."
```

#### 4. 环境变量未加载
```bash
# 检查 .env 文件是否存在
ls -la .env

# 验证环境变量
npm run env:validate
```

### 获取帮助
- 📖 查看项目文档: `docs/`
- 🐛 提交问题: GitHub Issues
- 💬 社区讨论: Telegram 群组
- 📧 联系开发者: [邮箱地址]

---

**最后更新**: 2025-10-31  
**版本**: v1.0.0