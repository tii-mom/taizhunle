# 太准了 Telegram 闭环验收清单

## 入口体验
- [ ] TG 群内点击「立即预测」跳转 Mini App
- [ ] Mini App 自动读取 start_param 并渲染对应市场
- [ ] 预加载 Ton Space 钱包提示

## 一键下注
- [ ] 第一次点击主按钮时，Ton Space 无弹窗连接
- [ ] 交易发送后 5 秒内生成下注记录 (Supabase.miniapp_oneclick_bets)
- [ ] Bot 收到 WebApp 回传并回复确认消息

## 闪电团
- [ ] 「发起闪电团」接口返回 crowdCode + shareUrl
- [ ] 差 1 人时推送提醒到原群聊
- [ ] 满员后自动将 crowd 状态改为 full

## 红包裂变
- [ ] 成功下注后显示分享红包按钮
- [ ] 分享链接带 crowdCode 及 ref 参数
- [ ] 再次打开 Mini App，主按钮依旧保持一键下注流程

## 部署验证
- [ ] `wrangler deploy` 机器人脚本成功发布
- [ ] `wrangler pages deploy dist --project-name taizhunle-mini` 成功
- [ ] 环境变量：BOT_TOKEN、SUPABASE_URL、SUPABASE_SERVICE_KEY、MINIAPP_JWT_SECRET、WEB_APP_URL
