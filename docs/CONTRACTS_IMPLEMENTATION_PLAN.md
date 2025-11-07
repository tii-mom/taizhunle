# Taizhunle 合约实现概览（2025-11-04）

> 本文同步当前链上实现的 4 套核心合约：TAI 解锁/白名单、预测市场、陪审质押、价格预言机。包含状态结构、消息接口、测试覆盖、部署脚本以及与 Web/后端的衔接方式，便于后续团队直接定位和扩展。

---

## 1. 总览

| 合约 | 主要职责 | DApp 配合模块 | 当前状态 |
| --- | --- | --- | --- |
| `tai_unlock_controller.tact` | 初始化 1,000 亿 TAI、红包销售、18 轮价格解锁、质押白名单认购、USDC/USDT 储备记录、暴跌兜底 | 资产页白名单面板 (`FinanceSections`)、`/api/whitelist/*`、链下 Merkle 工具脚本 | ✅ 已编译并通过 Vitest，部署脚本就绪 |
| `prediction_market.tact` | 链上创建/下注/结算市场，锁定创作者质押，拆分手续费并向质押合约发送奖励/罚没消息 | 预测详情页、下注流程、`marketService`（后续迁移到链上） | ✅ 合同草案 + sandbox 测试通过，等待与前端联调 |
| `juror_staking.tact` | 陪审员质押、累计质押天数、罚没、奖励记录，提供白名单配额 `whitelistQuotaOf` | DAO 控制台（质押、积分展示）、白名单配额计算脚本 | ✅ sandbox 测试通过，需在生产部署后接入 RPC |
| `tai_oracle.tact` | 接收 RedStone 喂价、输出 3 日均价、校验解锁涨幅、过滤异常波动 | 解锁合约 `RecordPrice`、后端价格看板 | ✅ sandbox 测试通过，需接驳 RedStone relayer |

---

## 2. `tai_unlock_controller.tact`

### 2.1 状态结构

```tact
const TOTAL_SUPPLY = 1_000_000_000_00000000; // 1,000 亿，8 位精度
const SALE_SUPPLY = 80_000_000_00000000;     // 红包 + 裂变销售 80 亿
const TEAM_FUND = 20_000_000_00000000;       // 团队营销 20 亿
const LOCKED_SUPPLY = TOTAL_SUPPLY - SALE_SUPPLY - TEAM_FUND;

struct UnlockState {
    currentRound: Int;          // 1-19
    remainingLocked: Int;       // 剩余锁仓
    saleClosed: Bool;           // 首轮是否结束
}

struct WhitelistSale {
    active: Bool;
    merkleRoot: Cell?;
    totalAmount: Int;           // 本轮可售额度
    soldAmount: Int;
    baselinePrice: Int;         // 上一轮价格 × 1e8
    currentPrice: Int;          // 当前估值 × 1e8（用于展示）
    windowEnd: Int;             // 结束时间
}

struct PriceRecord {
    timestamp: Int;
    price: Int;                 // 1e8 精度的 TAI/USDT
}
```

全局字段：管理员地址 `admin`、运营资金池 `treasury`、红包销售付款地址、稳定币储备 `reserveUsdc/reserveUsdt`、质押白名单使用量 `whitelistUsage` 等。

### 2.2 核心流程

1. **初始化**：部署时一次性铸造 1,000 亿 TAI → `TEAM_FUND` 直接转运营钱包 → `SALE_SUPPLY` 保留在合约用于红包/裂变 → 其余进入锁仓（18 轮×50 亿）。
2. **价格喂入**：调用 `RecordPrice {timestamp, price}` 前需先通过 `tai_oracle` 计算 3 日均值，合约会判断对应轮次的涨幅门槛：
   - 第 2–7 轮需较上一轮价格 +100%，并持续 ≥24h。
   - 第 8–13 轮 +80%。
   - 第 14–19 轮 +50%。
3. **解锁触发**：任何人都可调用 `UnlockRound {}`，满足条件即释放 50 亿到合约内部余额，再按照 40% 团队、60% 质押白名单的比例拆分：
   - 团队份额立即转入运营钱包。
   - 白名单份额写入 `whitelistSale.totalAmount`。
4. **白名单认购**：
   - 管理员调用 `StartWhitelistSale {totalAmount, baselinePrice, currentPrice, windowSeconds, merkleRoot}` 启动窗口（默认 72h 上限）。
   - 质押用户调用 `PurchaseWhitelist {amount, quota, beneficiary, proof}`（USDC/USDT 支付，proof 来源于链下脚本）；合约验证 Merkle Proof → 增加 `reserveUsdc` → 把 TAI 转给用户。
   - `CloseWhitelistSale {}` 在窗口结束或售罄时调用，自动把剩余 TAI 退回运营钱包。`CancelWhitelistSale {}` 可紧急终止并关闭窗口。
5. **储备池 / 暴跌兜底**：在 `PurchaseWhitelist` 时累计 USDC/USDT；管理员可发送 `TriggerEmergencyBuyback {pricePrev, priceNow}` 记录暴跌事件（当前为占位，留待与链上 DEX 对接）。

### 2.3 Getter & 工具

- `saleInfo()`: 首轮红包销售状态（剩余额度、售出量、结束时间）。
- `unlockStatus()`: 当前轮次、剩余锁仓、上轮价格、是否暂停。
- `whitelistSaleInfo()`: 白名单窗口状态 + 剩余额度。
- `whitelistUsed(address)`: 用户已购买额度。
- `supplySummary()`: 总量/锁仓/流通。

### 2.4 DApp & 脚本配合

- `scripts/generate-whitelist-merkle.ts`：读取 `juror_staking` 的 `stakeAmount/stakeDays`，按公式 `min(质押×0.8 + 天数×0.01, 质押×0.5)` 生成配额与 Merkle 树。
- `scripts/encode-start-whitelist-sale.ts`：将 Merkle 根、窗口参数编码成 BOC（base64），便于广播。
- `scripts/deploy-whitelist-sale.ts`：示例脚本，使用 `.env` 助记词构造 `StartWhitelistSale` 交易。
- 资产页 `FinanceSections.tsx` → `useWhitelistStatus`/`useWhitelistQuota`/`useWhitelistPurchase`，将配额与 proof 展示给用户，并通过 TonConnect 触发 `PurchaseWhitelist`。

### 2.5 测试覆盖

`contracts/tests/TAIUnlockController.test.ts`
- 初始化总供给、红包销售。
- `RecordPrice` + `UnlockRound` 条件判断。
- 白名单启动/购买/窗口关闭流程。
- 剩余额度回退、稳定币储备计数。
- 暂停与禁止重复操作等异常分支。

---

## 3. `prediction_market.tact`

（与原计划保持一致，大部分逻辑已实现，以下为关键摘要。）

### 3.1 状态结构

```tact
struct Market {
    id: Int;
    creator: Address;
    creatorStake: Int;
    closeTime: Int;
    status: Int;           // 0=open,1=locked,2=resolved,3=void
    outcome: Int;          // 0=未定,1=YES,2=NO,3=作废
    yesPool: Int;
    noPool: Int;
    feeBps: Int;           // 默认 200 (2%)
    jurorRewardBps: Int;   // 默认 100 (1%)
    metadata: Cell?;       // 存储标题哈希/参考链接等
}
```

全局：`admin`, `treasury`, `stakingAddress`, `nextMarketId`, `markets`, `marketBets`, `pendingCreatorStake`。

### 3.2 消息接口

| 消息 | 调用方 | 说明 |
| --- | --- | --- |
| `CreateMarket` | 用户 | 携带创作者质押（TAI Jetton 版本待接入），生成市场记录 |
| `PlaceBet` | 用户 | 下注 YES/NO，自动拆分手续费并更新赔率 |
| `LockMarket` | 管理员 | 到期后锁定市场，阻止继续下注 |
| `ResolveMarket` | 管理员/陪审 | 写入最终结果，向 `juror_staking` 发送 `DistributeReward`/`Slash` |
| `VoidMarket` | 管理员 | 作废市场，退还所有下注与质押 |
| `ClaimWinnings` | 用户 | 领取收益（按盈亏结算） |
| `WithdrawFees` | 管理员 | 提走平台手续费到 `treasury` |

### 3.3 测试重点
- 创建 → 下注 → 锁定 → 结算全链路。
- 赔率计算、手续费拆分、创作者质押返还。
- 作废/罚没路径。
- 重复调用、截止时间超时等异常。

---

## 4. `juror_staking.tact`

### 4.1 状态与配额

```tact
struct StakeInfo {
    amount: Int;
    accumulatedSeconds: Int;
    lastUpdate: Int;
    penaltyCount: Int;
    pausedUntil: Int;
}
```

- `stakeTable: map<Address, StakeInfo>`
- `pendingRewards: map<Address, Int>`
- `whitelistQuotaOf(user)`：计算公式 = `min(amount*0.8 + stakeDays*0.01, amount*0.5)`。

### 4.2 消息
| 消息 | 说明 |
| --- | --- |
| `Stake` / `Unstake` | 追加或赎回质押，自动刷新天数累计 |
| `RecordParticipation` | 后端可增减积分（可选） |
| `Slash` | 预测合约调用，按比例罚没质押到 `treasury` |
| `DistributeReward` | 预测合约调用，写入奖励列表 |
| `ClaimReward` | 陪审员主动领取奖励 |
| `PauseStaker` / `ToggleEmergency` | 管理员控制 |

### 4.3 测试
- 质押/解押 + 天数累计。
- 罚没后余额和奖励流水。
- 白名单配额计算、暂停逻辑。

---

## 5. `tai_oracle.tact`

### 5.1 状态
- `priceHistory: map<Int, PriceEntry>`（key 为日序号 `timestamp / 86400`）。
- `latestTimestamp`, `latestPrice`。

### 5.2 消息 & Getter
| 名称 | 说明 |
| --- | --- |
| `PushPrice` / `BatchPushPrice` | RedStone relayer 写入价格（校验时间递增） |
| `Reset` | 管理员手动重置（应急） |
| `latest()` | 返回最近一次记录 |
| `average(days)` | 默认 3 天平均，并过滤 ±30% 离群值 |
| `canUnlock(lastPrice, requirementBps)` | 判断是否满足涨幅条件 |

### 5.3 测试
- 顺序写入价格、平均值计算。
- 离群过滤（±30%）与涨幅判断。
- 时间重复/倒序、异常值报错。

---

## 6. 构建、测试与部署

1. **编译**：
   ```bash
   cd contracts
   npm run compile
   ```
2. **测试**：
   ```bash
   cd contracts
   npm test              # Vitest + @ton/sandbox
   ```
3. **部署脚本**：
   - `contracts/scripts/deployPredictionMarket.ts`
   - `contracts/scripts/deployJurorStaking.ts`
   - `contracts/scripts/deployTaiOracle.ts`
   - `contracts/scripts/deployUnlockController.ts`
   - `scripts/deploy-whitelist-sale.ts`
   > 脚本使用 `.env` 中的 `TON_OWNER_MNEMONIC`，执行后会输出合约地址；请写入 `addresses.json` 与主项目 `.env`。
4. **环境变量**：
   - `TAI_UNLOCK_CONTROLLER`
   - `PREDICTION_MARKET_CONTRACT`
   - `JUROR_STAKING_CONTRACT`
   - `TAI_ORACLE_CONTRACT`
   - `TON_TREASURY_ADDRESS`
   - `TON_WHITELIST_TREASURY`
   - `TON_OWNER_MNEMONIC`（部署时使用，谨慎保管）

## 已部署合约地址 (Testnet)

- `TAI_UNLOCK_CONTROLLER`: EQB9NffSKbslsvIY7Wi5pQL15KuWlgVAqqai_0W3Q1cZp9HW
- `PREDICTION_MARKET_CONTRACT`: EQCz_WsJ-14P_-URq0AT-HfGAWAyBt_WnLcor6s7tDTeq9lJ
- `JUROR_STAKING_CONTRACT`: EQC4SVjr97GTvW7l8AWTDXwCRAx5dcP9tAJjNmGcsv05L7ih
- `TAI_ORACLE_CONTRACT`: EQAt6joNLn0QZEAM0IpaQLWWvbtLDXCrTAMyR1RrwbL3qelJ

部署时间: 2025-11-07
网络: TON Testnet

---

## 7. 端到端衔接

| 流程 | 合约动作 | 后端/前端配合 |
| --- | --- | --- |
| 解锁 50 亿 | `RecordPrice` → `UnlockRound` | 后端定时任务调用 RedStone 接口，达到条件后通知运营执行解锁 |
| 白名单启动 | `StartWhitelistSale` | 链下脚本输出 BOC → 运营通过部署脚本或 TonConnect 广播 |
| 白名单认购 | `PurchaseWhitelist` | 资产页 `useWhitelistPurchase` 生成 cell → TonConnect 发送 → 返回成功后刷新额度 |
| 暴跌兜底 | `TriggerEmergencyBuyback` | 需要上线链上 DEX 集成逻辑；目前仅记录事件 |
| 预测结算 | `ResolveMarket` | 预测详情后台调用（或 DAO 审核）→ 发放奖励/罚没消息 → 前端更新状态 |

---

## 8. 后续建议

1. **接入真实 Jetton**：将当前内部记账转为链上 TAI Jetton（buy/sell/claim 调用实际 Jetton 合约）。
2. **完成回购执行**：在 `TriggerEmergencyBuyback` 中集成 DEX Swap（如 STON.fi），使用 `reserveUsdc/reserveUsdt` 实际回购后销毁。
3. **事件索引**：待 Tact 正式支持 `event` 后补充，临时可通过交易解析（The Graph 或自建 indexer）。
4. **部署自动化**：在 CI 中加入 `npm run compile` + `npm test`，并生成部署产物归档。
5. **权限与安全**：管理员地址建议切换多签；脚本执行前添加二次确认。

---

如需变更或新增合约，请在本文基础上更新职责表、消息接口与部署脚本，保持交接文档与实际实现同步。
