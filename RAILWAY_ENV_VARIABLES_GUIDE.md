# Railway 环境变量配置指南

## 在哪里填写环境变量？

1. 打开你的 Railway 项目：https://railway.com/project/5d1e9b9c-a1f6-46e3-a48d-c79c12a70481
2. 点击你的服务（Service）
3. 点击顶部的 **"Variables"** 标签
4. 点击 **"+ New Variable"** 或 **"Raw Editor"** 来批量添加

## 必需的环境变量（服务器无法启动如果缺少这些）

### 1. 基础配置
```bash
NODE_ENV=production
PORT=3000
```

### 2. Supabase 数据库配置（必需）
```bash
SUPABASE_URL=https://pnpkesnkteeagweilkwe.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGtlc25rdGVlYWd3ZWlsa3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTQyNDYsImV4cCI6MjA3NzM3MDI0Nn0.f3acD7cEeAN5Fy6kXp6Slrzdey--KMHZdvC0McVq3LQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGtlc25rdGVlYWd3ZWlsa3dlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc5NDI0NiwiZXhwIjoyMDc3MzcwMjQ2fQ.AR-FDJNeDPKgVrsWnvbqd6PDuaQts2qlxHskwlksBx0
```

### 3. Telegram Bot 配置（如果使用 Bot 功能）
```bash
TELEGRAM_ADMIN_BOT_TOKEN=your-telegram-token
TELEGRAM_ADMIN_IDS=123456789
```
**注意：** 如果你没有 Telegram Bot，可以暂时不填，但某些功能会不可用。

### 4. 安全密钥
```bash
JWT_SECRET=your-jwt-secret-change-this-to-random-string
```
**重要：** 生成一个随机字符串，不要使用示例值！

## 可选的环境变量（功能性配置）

### 5. Mock 数据模式（开发/测试用）
```bash
ENABLE_MOCK_DATA=true
```
**说明：** 设置为 `true` 可以在没有真实数据时测试系统

### 6. DAO 费用分配配置
```bash
FEE_CREATE=50
FEE_JURY=100
FEE_INVITE=50
FEE_PLATFORM=100
```

### 7. TON 区块链配置
```bash
TON_NETWORK=testnet
TONCENTER_API_KEY=061f4bf26320172112a42b870c02de9a235a795d52960bd80c3fbcdfa8d08891
TON_API_KEY=your-ton-api-key
```

### 8. TON 合约地址
```bash
TAI_UNLOCK_CONTROLLER=EQB9NffSKbslsvIY7Wi5pQL15KuWlgVAqqai_0W3Q1cZp9HW
PREDICTION_MARKET_CONTRACT=EQCz_WsJ-14P_-URq0AT-HfGAWAyBt_WnLcor6s7tDTeq9lJ
JUROR_STAKING_CONTRACT=EQC4SVjr97GTvW7l8AWTDXwCRAx5dcP9tAJjNmGcsv05L7ih
TAI_ORACLE_CONTRACT=EQAt6joNLn0QZEAM0IpaQLWWvbtLDXCrTAMyR1RrwbL3qelJ
```

### 9. TON 钱包地址
```bash
TON_TREASURY_ADDRESS=EQCxJ05yeawVWlsN5SfJ-obajgh2lFffR-O7ebH_s_wqQamv
TON_WHITELIST_TREASURY=EQCxJ05yeawVWlsN5SfJ-obajgh2lFffR-O7ebH_s_wqQamv
UNLOCK_TREASURY=EQCxJ05yeawVWlsN5SfJ-obajgh2lFffR-O7ebH_s_wqQamv
USDC_MASTER_ADDRESS=EQCxJ05yeawVWlsN5SfJ-obajgh2lFffR-O7ebH_s_wqQamv
```

### 10. TON 部署助记词（仅在需要部署合约时）
```bash
TON_DEPLOY_MNEMONIC=decide audit charge drift risk unable random indicate leopard minimum project girl tag hope copy wise float spoon gap denial dish word satisfy hard
```
**警告：** 这是敏感信息！确保 Railway 项目是私有的。

### 11. RSS 新闻源
```bash
RSS_ESPN=https://www.espn.com/espn/rss/news
RSS_BBC=https://feeds.bbci.co.uk/news/rss.xml
RSS_SINA=https://rss.sina.com.cn/news/marquee/ddt.xml
RSS_COIN=https://cointelegraph.com/rss
```

### 12. Twitter API
```bash
TWITTER_BEARER=AAAAAAAAAAAAAAAAAAAAAG9N2AEAAAAAEXzKn%2BBAwjybwNyl5CNo4lIQq9g%3DvtzQy70ydI4TGHIcC4jFNPI1wHp4XlgYoPPkpWhbMyimqvGfhy
```

### 13. LLM API（AI 功能）
```bash
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
LLM_API_KEY=c1f3574aafd34bf29096d2e9ff13ccb6.L2MRjuO76SryH90X
```

## 快速配置步骤

### 方法 1：使用 Raw Editor（推荐，快速批量添加）

1. 在 Railway Variables 页面，点击 **"Raw Editor"**
2. 复制下面的最小配置，粘贴进去：

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://pnpkesnkteeagweilkwe.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGtlc25rdGVlYWd3ZWlsa3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTQyNDYsImV4cCI6MjA3NzM3MDI0Nn0.f3acD7cEeAN5Fy6kXp6Slrzdey--KMHZdvC0McVq3LQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGtlc25rdGVlYWd3ZWlsa3dlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc5NDI0NiwiZXhwIjoyMDc3MzcwMjQ2fQ.AR-FDJNeDPKgVrsWnvbqd6PDuaQts2qlxHskwlksBx0
JWT_SECRET=change-this-to-a-random-secret-string-for-production
ENABLE_MOCK_DATA=true
TON_NETWORK=testnet
```

3. 点击 **"Update Variables"**
4. Railway 会自动重新部署

### 方法 2：逐个添加

1. 点击 **"+ New Variable"**
2. 输入变量名（例如：`NODE_ENV`）
3. 输入变量值（例如：`production`）
4. 点击 **"Add"**
5. 重复以上步骤添加所有必需变量

## 验证配置

部署完成后，检查日志：

1. 在 Railway 项目中点击 **"Deployments"**
2. 点击最新的部署
3. 查看日志，应该看到：
   ```
   ✅ 环境配置加载成功
   - 环境 / Environment: production
   - 端口 / Port: 3000
   - TON 网络 / TON Network: testnet
   ```

## 常见问题

### Q: 服务器启动失败，显示 "supabaseUrl is required"
**A:** 检查 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确填写

### Q: 如何生成安全的 JWT_SECRET？
**A:** 在本地运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q: 是否需要填写所有变量？
**A:** 不需要。最小配置只需要：
- NODE_ENV
- PORT
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- JWT_SECRET

其他变量可以根据需要的功能逐步添加。

### Q: 修改变量后需要重新部署吗？
**A:** Railway 会自动检测变量变化并重新部署服务。

## 安全建议

1. ✅ 不要在公开的代码仓库中提交 `.env` 文件
2. ✅ 为生产环境使用强随机的 `JWT_SECRET`
3. ✅ 定期轮换敏感的 API 密钥
4. ✅ 使用 Railway 的环境变量功能，不要硬编码在代码中
5. ⚠️ `TON_DEPLOY_MNEMONIC` 包含钱包私钥，务必保密

## 下一步

配置完环境变量后：
1. 等待 Railway 自动部署完成
2. 检查部署日志确认没有错误
3. 访问 Railway 提供的 URL 测试服务
4. 查看 `/health` 端点确认服务运行正常
