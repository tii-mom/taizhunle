# 质押式预测创建系统 - 更新总结

- 创建模式已切换为“按等级质押 + 奖池 1% 陪审奖励”。
- 后端 (`marketService`, `/api/markets`) 接受 `creatorStakeTai`，不再扣除固定费用。
- Mock 服务、类型定义、前端创建表单、首页/详情卡片与 DAO 说明同步更新。
- 多语言文本、运营文档和投资人简报均已替换为新的质押/扣减描述。

---

## ✨ 已完成
- [x] 质押映射：`getCreationStakeRequirement` 覆盖普通用户及四级陪审员。
- [x] 奖励计算：所有市场卡片使用 `pool * 1%` 动态奖励，并对小奖池保底 100 TAI。
- [x] 前端 UI：创建表单展示质押卡片、冷却与扣减规则；Market 卡片、详情页展示 Creator Stake + 冷却。
- [x] Mock 数据：创建、下注后奖励即时刷新，权限接口返回 `requiredStakeTai`。
- [x] 文档梳理：`MARKET_CREATION_LIMITS.md`、`DAO_JUROR_SYSTEM_DESIGN_V2.md`、`docs/INVESTOR_BRIEF.md` 重写为质押机制。
- [x] 单元测试：覆盖质押映射与 Mock 服务奖励逻辑。

## 🧭 下一步
- [ ] 针对真实 `marketService` 编写集成测试（结合 Supabase stub）。
- [ ] Ranking/运营后台等页面同步展示 Creator Stake 信息。
- [ ] 定期回顾质押扣减数据，优化等级线与冷却策略。

---

## 🛠️ 快速参考
- 质押 ↔ 冷却表：
  - 普通用户：1,000 TAI / 360h
  - 0-99 积分：1,000 TAI / 72h
  - 100-399 积分：5,000 TAI / 48h
  - 400-999 积分：10,000 TAI / 24h
  - 1000+ 积分：20,000 TAI / 6h
- 违规扣减：申诉成功 -50%，恶意 -100%，超时未结算 -20%。
- 奖励来源：实时奖池 × 1%，面向陪审员平分。
- API：
  - `GET /api/markets/creation/permission` → `requiredStakeTai`、`stakeCooldownHours`。
  - `POST /api/markets` → 传入 `creatorStakeTai`。

---

如需更多细节，请参见 `MARKET_CREATION_LIMITS.md` 与 `docs/STAKE_REWARD_MIGRATION_PLAN.md`。
