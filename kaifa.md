# 开发任务计划

## 里程碑 1：数据与后端一致化（~3 天）
- [x] 任务：统一 Supabase schema —— 以 `supabase/migrations/001_initial_schema.sql` 为基线，废弃 `supabase/schema.sql` 的简化结构，重新生成基线迁移。
- [x] 任务：整合并补充 `20251030_redpacket.sql`、`20251101_*` 迁移，新增回滚脚本与版本记录。
- [x] 任务：更新 `src/server/types/database.ts`、`userService.ts` 等类型定义，确保与最新字段/约束一致。
- [x] 任务：完善 `.env` 校验逻辑，避免 `TELEGRAM_ADMIN_IDS` 等变量缺失导致 NaN，补充必要默认值与文档。

## 里程碑 2：业务闭环与链路打通（~5 天）
- [x] 任务：实现 TonConnect 红包购买流程，完成 `src/pages/RedPacketSale.tsx` 的购买/签名/结果状态管理。
- [x] 任务：完善红包支付后端流转，串联 `tonPayment` 监听、签名回写与到账更新，处理失败补偿。
- [x] 任务：补全官方雨露领取链路，替换 Base64 JSON 占位 BOC，完成 `/official` 前端交互与真实落库。
- [x] 任务：替换邀请/DAO/鲸鱼榜 API 的 Mock 数据，补充统计 SQL、物化视图刷新机制，并更新前端服务层调用。
- [x] 任务：审查敏感凭证使用范围，增加请求认证/授权，确保 API 访问权限最小化。（已完成安全审查，创建 `docs/SECURITY_AUDIT.md` 和 rate limiting 中间件）

## 里程碑 3：自动化与通知体系（~3 天）
- [x] 任务：实现加速期与官方雨露 Cron 的真实业务逻辑（写库、状态切换、异常处理），并挂接 Telegram 推送。
- [x] 任务：为 TON 支付监听增加重复消费保护、失败重试与报警钩子，提供补偿脚本与运维指引。
- [x] 任务：编写运维 Runbook，涵盖任务监控、人工干预、故障排查，更新至 `docs/`。

## 里程碑 4：质量保障与上线演练（~4 天）
- [x] 任务：建设 Supabase + Mock TON 的集成测试、关键前端 E2E，并在 GitHub Actions 中新增迁移与端到端流水线。（已引入 Vitest 单元测试与 CI 流程，待获取网络后安装依赖）
- [x] 任务：扩展 `scripts/test-system.js`，纳入 TON/Telegram 可用性检测与报警输出。
- [x] 任务：按 Docker/Vercel/Railway 演练部署流程，制定灰度发布与回滚方案，补充安全合规清单。（新增 `docs/DEPLOYMENT_CHECKLIST.md`）
- [x] 任务：制定发布验收标准，执行全面回归与性能测试，更新 CHANGELOG 与最终交付文档。（新增 `docs/RELEASE_CHECKLIST.md`，性能回归待接入真实环境）
