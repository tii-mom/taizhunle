# 自动化任务运行手册

## 1. 红包加速期调度 (`startAccelerateJob`)
- **Cron**: 20:00 开启，00:00 关闭（CRON_TIMEZONE 可配置，默认为 UTC）
- **逻辑**:
  - 调用 `ensureSaleRecord` 获取当前销售记录
  - 更新 `redpacket_sales.accelerate` 和 `accelerate_rate`
  - 通过 `notifyAdmins` / `notifyChannel` 推送 Telegram 消息
- **监控**:
  - 日志关键字：`Acceleration started` / `Acceleration ended`
  - Supabase 检查：`redpacket_sales` 最近 `updated_at`
- **故障处理**:
  1. 手动执行 `scripts/monitor-cron.ts` 确认状态
  2. 若失败，使用 Supabase 控制台手动执行更新语句
  3. 对应通知可通过 `notifyAdmins()` 手动触发

## 2. 官方雨露生成 (`startOfficialCreateJob`)
- **Cron**: 每日 12:00、14:00、18:00、22:00（CRON_TIMEZONE）
- **逻辑**:
  - 检查是否存在未结束的 `official_rain`
  - 生成新记录（含金额、奖励区间、参与上限）
  - 推送 Telegram 通知
- **监控**:
  - 日志关键字：`Official rain created`
  - Supabase 查看 `official_rain` 的最新记录和 `status`
- **故障处理**:
  - 使用 `scripts/monitor-cron.ts` 查看最新记录
  - 手动执行 `createOfficialRainDrop()`，再调用 `notifyAdmins`

## 3. TON 支付监听 (`startTonPaymentListener`)
- **周期**: 每 15 秒轮询 redpacket 支付地址
- **逻辑**:
  - 调用 TON API (`TON_API_ENDPOINT` + `TON_API_KEY`)
  - 根据 memo 匹配 `redpacket_purchases`
  - 标记 `awaiting_signature` 并生成 BOC
- **监控**:
  - 日志关键字：`TON payment processed`
  - Supabase：`redpacket_purchases` 的 `payment_detected_at`
- **故障处理**:
  - 确认 TON API Key 可用，检查防火墙 / 网络
  - 重启服务或手动执行 `markPurchaseAwaitingSignature`
  - 若重复失败，请在 `redpacket_purchases` 记录 `error_reason`

## 通用排障步骤
1. `npm run env:validate` 确认环境变量完整
2. 检查 Telegram Bot Token 与频道 ID 有效
3. 使用 `npm run logs` (需自建) 或服务端监控查看错误
4. 如需暂停任务，可设置 `ENABLE_PRICE_ADJUSTMENT=false` 等开关
