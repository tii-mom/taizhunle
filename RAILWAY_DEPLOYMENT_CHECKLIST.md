# ✅ Railway 部署检查清单

## 📋 部署前检查

- [ ] 已注册 Railway 账号
- [ ] 已连接 GitHub 账号
- [ ] 代码已推送到 GitHub
- [ ] 已准备好所有环境变量

## 🚀 部署步骤

### 1. 创建项目
- [ ] 在 Railway 点击 "New Project"
- [ ] 选择 "Deploy from GitHub repo"
- [ ] 选择 `tii-mom/taizhunleyuce` 仓库
- [ ] 点击 "Deploy Now"

### 2. 配置环境变量
- [ ] 点击项目 → Variables 标签
- [ ] 添加 `NODE_ENV=production`
- [ ] 添加 `PORT=3002`
- [ ] 添加所有 Supabase 变量
- [ ] 添加所有 TON 变量
- [ ] 添加 JWT_SECRET
- [ ] 添加 Telegram 变量（可选）
- [ ] 点击 "Deploy" 重新部署

### 3. 等待部署完成
- [ ] 查看 Deployments 标签
- [ ] 等待状态变为 "Success"
- [ ] 检查 Logs 确认无错误

### 4. 获取部署 URL
- [ ] 点击 Settings 标签
- [ ] 找到 "Domains" 部分
- [ ] 复制 Railway 提供的 URL
- [ ] 格式：`https://你的项目名.up.railway.app`

### 5. 测试部署
- [ ] 访问 `https://你的URL/health`
- [ ] 应该看到 `{"status":"ok"}`
- [ ] 访问 `https://你的URL`
- [ ] 应该看到你的应用界面

## 🔧 部署后配置

### 6. 配置自定义域名（可选）
- [ ] 在 Settings → Domains
- [ ] 点击 "Add Domain"
- [ ] 输入你的域名
- [ ] 按照提示配置 DNS

### 7. 配置 Telegram Bot
- [ ] 更新 Bot 的 Webhook URL
- [ ] 设置为 `https://你的URL/api/telegram/webhook`

### 8. 更新前端 API 地址
- [ ] 如果前端单独部署
- [ ] 更新前端的 API_URL 环境变量
- [ ] 指向 Railway 的 URL

## ⚠️ 常见问题

### 部署失败
- 检查 Logs 查看错误信息
- 确认所有环境变量都已添加
- 确认 package.json 中的脚本正确

### 应用无法访问
- 确认 PORT 环境变量设置为 3002
- 检查 Railway 是否分配了公网 URL
- 查看 Logs 确认服务器已启动

### 数据库连接失败
- 确认 Supabase 变量正确
- 检查 Supabase 项目是否正常运行
- 确认 IP 白名单设置（如果有）

## 💰 费用提醒

- Railway 免费额度：$5/月
- 超出后按使用量计费
- 建议设置用量警报

## 📞 需要帮助？

如果遇到问题：
1. 查看 Railway Logs
2. 检查环境变量
3. 参考 RAILWAY_ENV_SETUP.md
4. 联系开发者
