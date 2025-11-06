# 预测创建质押 & 陪审奖励 1% 改造计划

## 背景
质押与奖励逻辑已替换为“按等级质押 + 奖池 1%”，下表记录剩余协作事项。

## 阶段 1：后端服务更新
- [x] `marketService.createMarketDraft` 改为：
  - 基于 `getCreationStakeRequirement` 直接锁定 `creatorStakeTai`，不再写入 juror_reward_tai。
  - 校验/记录质押，落表字段 `creator_fee`、`admin_notes.creatorStakeTai`、`stakeCooldownHours`。
  - 抛弃 DAO pool 100 TAI 记录。
- [x] `mapPrediction` 输出字段：`creatorStakeTai`、`stakeCooldownHours`，`jurorRewardTai=total_pool*0.01`。
- [x] `getMarketCreationPermission` 返回 `requiredStakeTai`、`stakeCooldownHours`，去掉旧 reward 字段。
- [x] Mock 服务保持一致（列表、创建、权限、placeBet）。
- [x] 更新 TypeScript 类型定义（`MarketCard`、`MarketDetailResponse`、API schema）。
- [x] 回归核心单测/加必要单测（新增 `tests/marketServiceCreation.test.ts` 覆盖 stake、冷却与异常分支）。
- [x] 增补端到端回归（`tests/e2e.marketFlow.test.ts`），保障创建→下注→奖励计算闭环。

## 阶段 2：前端体验与状态
- [x] 创建表单：
  - 移除陪审奖励输入，改为展示“需锁定 X TAI / 冷却 Y 小时”。
  - 提交 payload 替换为 `creatorStakeTai`。
  - 冷却提示/错误文案匹配新字段。
- [x] 首页/详情 Market 数据：
  - 使用 `creatorStakeTai` 显示创建质押。
  - 陪审奖励展示 = `jurorRewardTai` (pool × 1%)。
  - 已更新 `MarketCardGlass`、`MarketDetailGlass`、`BetModalGlass`。
- [x] Ranking/DAO 其它页面同步展示质押/奖励。
- [x] 组件/Hook (`useMarketDetailQuery`, `useBetExecutor`, etc.) 同步新类型。

## 阶段 3：多语言 & 文档
- [x] 清理 zh/en 文案中的“100 TAI 创建费”“实时奖励”等旧描述。
- [x] 更新 `MARKET_CREATION_UPDATE_SUMMARY` 文档。
- [x] 补充 README/运营 Runbook 中的质押与奖励流程。

## 验收
1. `npm run lint`、`npm test -- --run` 通过。
2. `npm run dev` 启动后：
   - 首页卡片展示创建质押 & 陪审奖励一致，倒计时准确。
   - 创建流程根据积分动态展示质押要求，提交成功写入 mock/实际 API。
   - DAO 相关页面说明与数据一致。
3. 文档 & i18n 结果无遗留旧文案。
