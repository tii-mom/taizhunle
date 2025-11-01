# Telegram Bot 设置指南

## 1. 创建管理员 Bot

### 步骤 1: 联系 BotFather
1. 在 Telegram 中搜索 `@BotFather`
2. 点击开始对话

### 步骤 2: 创建新 Bot
```
/newbot
```

### 步骤 3: 设置 Bot 信息
- **Bot 名称**: `Taizhunle Admin Bot` (或你喜欢的名称)
- **Bot 用户名**: `taizhunle_admin_bot` (必须以 `_bot` 结尾)

### 步骤 4: 获取 Token
BotFather 会给你一个类似这样的 Token:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 步骤 5: 配置 Bot 权限
```
/setcommands
```
选择你的 Bot，然后发送：
```
start - 启动 Bot
help - 显示帮助
status - 查看系统状态
soldout - 查看红包销售状态
next - 查看下轮官方雨露时间
stats - 管理员统计数据
price - 查看红包价格
accelerate - 查看加速期状态
```

## 2. 创建用户 Bot (可选)

如果需要分离管理和用户功能，重复上述步骤创建第二个 Bot：
- **Bot 名称**: `Taizhunle User Bot`
- **Bot 用户名**: `taizhunle_user_bot`

## 3. 创建频道和群组

### 创建频道
1. 创建新频道: `Taizhunle 官方频道`
2. 设置频道为公开，用户名: `@taizhunle`
3. 将 Bot 添加为管理员
4. 获取频道 ID (通过 Bot 发送消息到频道)

### 创建群组
1. 创建新群组: `Taizhunle 社区`
2. 将 Bot 添加为管理员
3. 获取群组 ID

## 4. 获取你的 Telegram ID

### 方法 1: 使用 @userinfobot
1. 搜索 `@userinfobot`
2. 发送任意消息
3. 获取你的 User ID

### 方法 2: 使用你的 Bot
1. 启动你的 Bot
2. 发送 `/start`
3. 查看服务器日志获取 User ID

## 5. 更新环境变量

将获取的信息填入 `.env` 文件：

```env
# Bot Token (必填)
TELEGRAM_ADMIN_BOT_TOKEN=你的管理员Bot Token
TELEGRAM_ADMIN_BOT_USERNAME=taizhunle_admin_bot

# 用户 Bot (可选)
TELEGRAM_USER_BOT_TOKEN=你的用户Bot Token
TELEGRAM_USER_BOT_USERNAME=taizhunle_user_bot

# 频道和群组 ID (必填)
TELEGRAM_CHANNEL_ID=-1001234567890
TELEGRAM_CHANNEL_USERNAME=@taizhunle
TELEGRAM_GROUP_ID=-1001234567891

# 管理员 ID (必填)
TELEGRAM_ADMIN_IDS=你的Telegram ID,其他管理员ID
```

## 6. 测试 Bot

1. 重启服务器
2. 在 Telegram 中找到你的 Bot
3. 发送 `/start` 测试
4. 发送 `/help` 查看命令

## 7. 设置 Webhook (生产环境)

### 使用 ngrok (开发测试)
```bash
# 安装 ngrok
npm install -g ngrok

# 启动隧道
ngrok http 3001

# 复制 HTTPS URL 到 .env
TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/webhook/telegram
```

### 生产环境
```env
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/webhook/telegram
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
```

## 常见问题

### Q: Bot 无法接收消息
A: 检查 Bot Token 是否正确，确保 Bot 没有被禁用

### Q: 无法获取频道 ID
A: 将 Bot 添加到频道作为管理员，然后发送消息查看日志

### Q: 权限错误
A: 确保 Bot 在频道/群组中有管理员权限

### Q: Webhook 错误
A: 检查 URL 是否可访问，HTTPS 证书是否有效

## 安全提醒

1. **保护 Bot Token**: 不要在代码中硬编码，使用环境变量
2. **限制管理员**: 只将信任的用户 ID 添加到管理员列表
3. **定期更新**: 如果 Token 泄露，立即通过 BotFather 重新生成
4. **监控日志**: 定期检查 Bot 使用日志，发现异常及时处理