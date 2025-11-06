# TAI 解锁 & 质押白名单认购方案

> 本文记录 2025-11-?? 的讨论结论，涵盖每轮 50 亿 TAI 的分配方式、质押用户白名单规则、稳定币储备池与应急回购机制，供后续实现参考。

## 1. 背景

- 每轮解锁 50 亿 TAI，需同时满足团队拨款与社区质押激励。
- 目标：保持解锁节奏透明、给长期质押者折价认购机会，并建立可审计的稳定币储备池，用于价格暴跌时的回购兜底。

## 2. 资金分配

| 流向 | 数量 | 说明 |
| --- | --- | --- |
| 团队 | 20 亿（40%） | 解锁后立即从 `tai_unlock_controller` 转入团队地址（沿用现有流程）。 |
| 白名单 | 30 亿（60%） | 保留在合约中，开启“质押优先认购”窗口，仅质押用户可按上一轮解锁价购入。 |

## 3. 白名单配额公式

- **公式**
  ```text
  quota = min(stakeAmount × 0.8 + stakeDays × 0.01 , stakeAmount × 0.5)
  ```
- **输入说明**
  - `stakeAmount`、`stakeDays` 由链上质押合约记录。
  - 系数 A = 0.8（按数量），系数 B = 0.01（按天数）。
  - 上限 = 质押量的 50%，避免过度认购。
- **生成方式**
  1. 每轮解锁完成后，链下脚本读取质押快照并计算 `quota`。
  2. 将 `{address, quota}` 构建成 Merkle Tree，记录 `merkleRoot`。
  3. 合约写入本轮 `merkleRoot`、`baselinePrice`（上一轮解锁价）、`currentPrice`（本轮解锁价）、窗口结束时间与 30 亿总量。

## 4. 认购窗口与流程

1. **窗口**：解锁后开放 72 小时或直至 30 亿售罄；期间名单冻结。如需紧急调整，调用 `cancelSale()` 终止当前轮，重新上传新 Root。
2. **购买**：
   - 用户调用 `purchaseWithWhitelist(amount, proof)`，合约验证 Merkle proof 与剩余额度。
   - 付款币种为 USDC（Ton 主网 Jetton 地址硬编码），USDT 保留为备用深度暂不开放。
   - 价格 = `baselinePrice`（上一轮解锁价），给予质押者折价福利。
3. **结束**：窗口到期或售罄后执行 `closeWhitelistSale()`：
   - 剩余 TAI：可配置为回流团队或留待下一轮（后续决定）。
   - 稳定币：全部留在储备池，进入应急资金。

## 5. 稳定币储备池与暴跌兜底

- 所有认购所得 USDC（及备用 USDT）沉淀在合约内，任何角色无权提前提取。
- 统一依赖 RedStone 价格预言机，做极端值平滑（滑动平均/离群截断）。
- 当检测到单日价格跌幅 ≥ 50% 时，可调用 `triggerEmergencyBuyback(priceFeedProof)`：
  - 审核 RedStone 提供的价格签名并校验 50% 条件。
  - 通过预设 DEX / Swap 路由使用储备池稳定币回购 TAI，为用户兜底。
  - 为防滥用，可在函数内加入冷却时间、多签确认或 DAO 投票钩子。

## 6. Merkle 生命周期与管理

- 每轮仅生成一次 Root，窗口期间不追加。如需修正列表，使用 `cancelSale()` + 新 Root 重新开启窗口。
- 链下脚本需保存原始 `{address, quota}` 与证明文件，前端/后端可提供查询接口（示例：`/api/whitelist/quota?address=`）。
- 购买流程需记录 `usedQuota[address]`，防止重复消费。

## 7. 集成与实施要点

1. **合约**：
   - `tai_unlock_controller` 新增 `WhitelistSale` 状态、支付校验、窗口控制、`cancelSale`/`closeWhitelistSale` 与应急回购接口。
   - 储备池支持持有 USDC（Jetton 地址硬编码）和 USDT（备用）。
2. **链下脚本**：
   - 定时任务：解锁后读取质押合约快照 → 计算配额 → 生成 Merkle Tree → 写入 root。
   - 输出 JSON 供前端/服务端读取（包含 proof）。
3. **前端**：
   - 在资产/DAO 页面增加“质押认购”入口，展示剩余额度、倒计时、折扣价、储备池余额。
   - 认购流程需整合 TonConnect，提交 proof + USDC 付款。
   - 资产页 `FinanceSections.tsx` 已落地 TonConnect 交易按钮，需在 `.env`/`.env.local` 配置 `VITE_TAI_UNLOCK_CONTROLLER` 与 `VITE_WHITELIST_GAS_TON` 以启用实际调用。
4. **后端**：
   - 提供 `/api/whitelist/quota`、`/api/whitelist/status` 等查询接口，封装 Merkle 证明与窗口状态。
   - 记录用户购买历史，便于客服/风控溯源。
5. **预言机**：
   - RedStone 单一数据源，解锁涨幅与暴跌兜底共用；在链上实现平滑逻辑，避免闪崩/脏数据误触发。

## 8. 后续 TODO

- [ ] 设计合约接口（函数签名、事件、状态变量）并评审。
- [x] 补充链下 Merkle 生成脚本（scripts/generate-whitelist-merkle.ts）支持配额计算、根哈希与 proof BOC。
- [x] 定义前端认购 UI/流程，联调 TonConnect 与 USDC Jetton。
- [ ] 规划储备池回购的 DEX 对接与安全措施（多签 / DAO 授权 / 冷却时间）。

### 工具链

- 生成白名单配额与 Merkle 元数据
  ```bash
  # stake_snapshot.json → [{ wallet, stakeAmount, stakeDays }]
  npx tsx scripts/generate-whitelist-merkle.ts stake_snapshot.json whitelist_quota.json whitelist_meta.json
  ```
  - `whitelist_quota.json`：每个地址的配额值与 proof（base64 BOC）。
  - `whitelist_meta.json`：包含 Merkle 根 BOC 及统计信息。

- 生成 `StartWhitelistSale` 参数（示例）
  ```bash
  npx tsx scripts/encode-start-whitelist-sale.ts whitelist_meta.json 30000000000 50000000 80000000 259200
  ```
  输出 JSON 中的 `merkleRoot` 为 base64 BOC，可配合部署脚本或多签工具发送消息。

- 发送交易（占位）
  ```bash
  export DEPLOY_MNEMONIC="word1 word2 ... word24"
  export TON_ENDPOINT="https://toncenter.com/api/v2/jsonRPC"
  npx tsx scripts/deploy-whitelist-sale.ts whitelist_meta.json 30000000000 50000000 80000000 259200 EQxxxx...
  ```
  > ⚠️ 生产环境请使用安全的密钥管理方案，避免在终端直接导出助记词；脚本默认使用 TON Wallet V4，如需多签或代理，需要自行调整。
