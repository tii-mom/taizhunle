# Taizhunle 项目交接速查（非技术同事版）

> 目标：帮助新同事在**不阅读代码**的情况下理解产品定位、界面功能、业务流程与当前进度。文中列出的代码路径仅用于对照来源，无需修改。

---

## 1. 产品概览

- **定位**：基于 TON 链的预测市场平台，配套红包裂变、官方雨露、邀请返利与陪审员 DAO 体系。
- **用户旅程**：
  1. 连接 TON 钱包 → 2. 浏览首页预测 → 3. 下注或创建新预测 → 4. 预测结算后根据手续费分配给创建者/陪审员/邀请人 → 5. 在资产页和 DAO 控制台查看收益、领取奖励。
- **技术组成（仅作背景）**：前端 React + Glass UI；后端 Express + Supabase；链上合约使用 Tact（TAI 发行与解锁、预测市场、陪审质押、喂价预言机）。
- **代币体系**：平台原生代币 **TAI** 总量 1,000 亿枚，部署在 `tai_unlock_controller` 合约中——20 亿已划入运营钱包，80 亿用于红包与裂变销售，余下 900 亿按 18 轮（每轮 50 亿）受价格解锁；白名单认购阶段支持 USDC/USDT 稳定币支付并直存储备池，后续暴跌时用于回购托底。**TON** 仍用作链上 Gas 与普通充值/提现。

---

## 2. 前端界面与主要交互

### 2.1 全局元素

- **钱包连接栏**（`src/components/home/HomeTopBar.tsx:1`）
  - 按钮：TonConnect 登录、余额查看、币种切换、语言切换（中/英）、主题切换、搜索入口。
  - 余额按钮会弹出详情浮层，可刷新 TAI/TON 数据。
- **玻璃拟态布局**：所有页面使用 `GlassPageLayout` 包裹（`src/components/glass/GlassPageLayout.tsx`），统一了背景、阴影、动效。
- **导航与返回**：底部/顶部浮动按钮来自 `CreateFloatingGlass`、`GlassButtonGlass`，保持统一手势反馈。

### 2.2 首页（预测大厅）

- 文件：`src/web/pages/HomeGlass.tsx`
- 功能区：
  - 筛选条（最新/最热/即将结束/高赏/My 收藏；状态：全部/进行中/1 小时内/已结束；奖池区间；分类）。
  - 搜索弹窗：输入关键字快速过滤市场。
  - 制作入口：右下角 `CreateFloatingGlass` 提供“发起预测”浮钮。
- 预测卡片（`src/components/glass/MarketCardGlass.tsx`）
  - 展示标签、赔率、倒计时、奖池进度、实时参与人数。
  - 收藏星标按钮（同步到首页“我的”筛选）。
  - “快速下注”按钮：弹出金额预设（50/100/250/500/1000/2500 TAI），确认后调用下注流程。

### 2.3 预测详情页

- 文件：`src/web/pages/MarketDetailGlass.tsx`
- 版块：
  - **系统信息卡**（`SystemInfoGlass`）展示最新赔率、奖池、陪审员数，并新增实时赔率图标（`useDynamicOdds`），当赔率跳动会出现对比提示。
  - **官方参考**：若创建时填了链接/摘要，会在“官方参考”卡片中展示；按钮允许跳转原文。
  - **实时资讯抽屉**（`MarketNewsDrawer.tsx`）：加载 `/api/markets/:id/news`，按情绪正/负/中性标色。
  - **下注模块**（`BetModalGlass.tsx`）：输入金额、选择“YES/NO”，内置快捷金额（100/500/1000/5000/全部），实时刷新预测赔率与预计收益。
  - **评论与讨论**：`src/components/market-detail/CommentFeed.tsx` 提供评论列表与发布入口，支持滚动查看社区观点。
  - **我的注单**：列出当前钱包在该市场的全部下注记录（金额、赔率、时间）以及最新进度。
  - **最新下注动态**：展示最近下注人的昵称/金额/收益预估。

### 2.4 创建预测流程

- 文件：`src/components/create/Form.tsx`
- 步骤：
  1. **填写主题**：输入标题，可从热门话题滑轨（`HotTopicSlider.tsx`）一键带入进度摘要与参考链接。
  2. **设置时间 & 范围**：选择预测截止时间、下注最小/最大额度；系统会根据陪审员积分给出推荐范围。
  3. **确认与质押**：选择创作者质押金额（至少为系统要求），勾选标签、参考链接后确认提交。
- 提交后调用 `POST /api/markets`，成功会刷新首页列表并提示“预测已发布”。

### 2.5 资产中心

- 文件：`src/pages/Assets.tsx`
- 核心组件：
  - `AssetHeader.tsx`：渐变面板集成 TonConnect 钱包、TAI 主余额卡（含 24h 涨跌）、TON Gas 卡、实时 TAI/USDT 价格，以及充值（`ChargeModalGlass`）、提现、兑换、流水记录四个操作按钮；点击 TAI/TON 卡会打开详情弹窗，显示数值、涨跌与刷新入口。
  - `AssetTrendDashboard.tsx`：资产曲线、收益率小卡片（当前仍用模拟数据，方便演示可视化效果）。
  - `FinanceSections.tsx`：上半区展示红包资产累计与“一键领取”，下半区为**质押白名单认购面板**，读取 `/api/whitelist/status` 与 `/api/whitelist/quota` 显示剩余额度、上一轮/当前估值，并支持快捷填充、Merkle Proof 签名提交（USDC/USDT 稳定币支付，交易成功后存入链上储备池）。

### 2.6 DAO/陪审员页面

- 文件：`src/pages/DaoGlass.tsx`
- 功能：
  - 个人概览：陪审积分、当前等级、每天可受理案件数、历史胜率、余额构成（可领取/锁定）。
  - 任务面板（`TaskList`）：列出待处理的申诉/仲裁任务，提供“参与”按钮（后端仍为占位）。
  - 质押与领取：Modal 支持 Stake/Unstake 操作，快捷领取 DAO 收益（按钮走 `/api/dao/claim`）。
  - 验证入口：提交 Telegram 账号/备注申请陪审员资格。
  - 等级规则：取自 `src/pages/dao/constants.ts` 与 `JurorSystemModal.tsx`，列出 L1-L4 所需积分、创建冷却时间等。

### 2.7 其它页面（保持关注但功能仍在迭代）

- **邀请**（`src/pages/Invite.tsx`）：生成邀请链接、查看贡献曲线、申请提现，当前返回值来自 mock 数据。
- **排行榜**（`src/components/ranking/RankingHero.tsx` 等）：展示鲸鱼榜、邀请榜、陪审榜，API 仍为模拟。
- **官方雨露**（`src/pages/OfficialRain.tsx`）：显示下一轮雨露详情与领取入口，链路待与后台打通。
- **红包销售**（`src/pages/RedPacketSale.tsx` & `components/redpacket/*`）：负责展示价格、裂变系数、购买流程，支付逻辑依赖后端监听。

---

## 3. 核心业务流程

### 3.1 创建预测 → 上线

1. 用户在创建页完成三步表单，客户端调用 `createMarketDraft`。
2. 服务端 `POST /api/markets`（`src/server/routes/markets.ts:55`）验证标题、时间、质押金额、标签白名单，然后写入 `predictions` 表。
3. 若开启 mock 模式（本地默认），数据先写入内存列表，便于快速演示。
4. 创建成功后：
   - 前端清除表单、刷新首页。
   - 服务端会调用 `ensureUserByWallet`、`incrementUserStats`（`marketService.ts`）记录创建次数。
   - Telegram 管理员通知接口已预留（`notifyAdmins`），待补充真实模板。

### 3.2 用户下注流程

1. 在首页卡片选择快速下注，或在详情页输入金额。
2. 前端 `useBetExecutor` 构造请求调 `POST /api/markets/:id/bets`。
3. 服务端 `placeBet`（`marketService.ts:244` 起）做以下操作：
   - 校验市场是否开放、钱包地址是否存在。
   - 把下注写入 `bets` 表；更新 `predictions` 奖池与赔率；刷新参与人数。
   - 计算手续费（见下一节）并落地 `dao_pool` 表。
   - 调用 `notifyAdmins/notifyChannel` 推送下注快讯。
4. 前端根据响应刷新赔率、我的注单列表（React Query 自动失效缓存）。

### 3.3 手续费与收益分配

- 计算逻辑位于 `src/server/services/feeDistributor.ts`：
  - 默认费率总计 3%（可通过环境变量调整）：
    - 创建者 0.5%，陪审员 1.0%，邀请人 0.5%，平台 1.0%。
  - 每次下注后，`distributeFees` 计算金额，`sendToPools` 写入 `dao_pool` 表（状态为 pending）。
  - 陪审员分润会均分到本场所有陪审员记录上。
- DAO 页面 `/api/dao/claim` 会查询 `dao_pool` 待领取记录并更新为 `claimed`，前端弹出成功提示。

### 3.4 陪审员（DAO）规则

- 积分与等级定义在 `src/pages/dao/constants.ts`：
  - L1（0~99 分）：每日可处理 3 个案件，创建冷却 72 h，需要质押 1,000 TAI。
  - L2（100~399 分）：每日 9 个案件，冷却 48 h，需 5,000 TAI。
  - L3（400~999 分）：每日 30 个案件，冷却 24 h，需 10,000 TAI。
  - L4（≥1000 分）：无限案件，冷却 6 h，需 20,000 TAI。
- 积分来源：
  - 陪审判决 +1 分；
  - 质押额越高，抽签权重越大（`calculateWeight`：权重 = (积分 + 10) × 质押额）。
- 当前实现状态：前端界面与 API 占位已完成；实际陪审任务、积分刷新需补充后端逻辑。

### 3.5 资产与资金流

- 资产页通过 `useAssetData` 聚合余额、红包、雨露数据；当 API 不可用时返回模拟值。
- 充值/提现/兑换按钮分别打开 `ChargeModalGlass`、`WithdrawModalGlass`、`ExchangeModalGlass`（位于 `src/components/glass`）。目前以表单占位为主，成功回调仅打印日志。
- 交易记录弹窗列出最近的 TAI/TON 流水，数据来自假数据，需要接入 `transactions` 表后替换。

### 3.6 TAI 解锁与白名单认购

- 链上逻辑由 `tai_unlock_controller.tact` 负责：初始化 1,000 亿 TAI，首轮 20 亿直转运营钱包，80 亿留作红包+裂变销售，其余 900 亿进入 18 轮锁仓，每轮 50 亿。
- 价格门槛：对接 `tai_oracle` 的 3 日均价，按阶段化涨幅（第 2~7 轮 +100%，第 8~13 轮 +80%，第 14~19 轮 +50%）且需满足 24h；达到条件后任何人可调用 `unlockRound`。
- 白名单认购：
  - 每轮解锁后 60%（30 亿）供陪审质押用户以**上一轮**价格购买；链下脚本 `generate-whitelist-merkle.ts` 计算额度、生成 Merkle root，写入 `startWhitelistSale` 消息。
  - 用户在资产页通过 `FinanceSections` 发起 `purchaseWhitelist`，上传 proof（USDC/USDT Jetton 支付）；资金留在合约储备池，等待 `closeWhitelistSale` 统一结算。
  - 窗口结束（或管理员手动调用 `CloseWhitelistSale`）后，会把未售出的 TAI 自动返还运营钱包；如需紧急终止，可用 `CancelWhitelistSale` 直接关闭。
- 储备池用途：合约实时累计 USDC/USDT 收入；若 TAI 日内跌幅 ≥50%，管理员可发送 `TriggerEmergencyBuyback` 消息触发应急回购（当前仅记录事件，后续需接入链上 DEX 执行实际回购）。

### 3.7 红包与官方雨露

- 红包销售：
  - 列表、购买 API 在 `src/server/routes/redpacket.ts`，支付完成后由 Ton 支付监听器（`src/server/listeners/tonPayment.ts`）校验金额并生成 unsigned BOC（供钱包二次签名）。
  - 加速期定时任务（`src/server/jobs/accelerate.ts`）在每天 20:00~24:00 提升裂变系数，并通过 Telegram 通知。
- 官方雨露：
  - `officialCreate` 定时任务每日 12/14/18/22 点生成新一轮雨露（金额、门票、奖励区间），并写入 `official_rain` 表。
  - 领取端点 `/api/official/:id/claim` 目前返回 base64 BOC，占位等待真实合约完成。

### 3.8 邀请与榜单

- 邀请服务（`src/services/inviteService.ts`、`src/server/services/inviteService.ts`）目前返回 mock 数据：实时统计、批量领取、生成邀请链接。
- 排行榜（`rankingService.ts`、`/api/ranking`）同样为模拟，界面已完成，后续需替换为真实 SQL 视图。

### 3.9 通知与自动化任务

- Telegram 服务（`src/server/services/telegramService.ts`）封装管理员群与频道通知，若网络异常会记录错误。
- 定时任务启动于 `src/server/main.ts`：价格调整、红包加速、官方雨露创建。
- TON 支付监听使用 `setInterval` 轮询 toncenter API（每 15s），比对 memo → 查订单 → 写入 payout 表。

### 3.10 智能合约现状

- `contracts/contracts/tai_unlock_controller.tact`：负责 TAI 锁仓释放、80 亿销售、白名单认购；`tests/TAIUnlockController.test.ts` 覆盖解锁、退款等路径。
- `contracts/contracts/prediction_market.tact`：预测市场主合约，处理创建/下注/结算、创作者质押及手续费拆分，并向质押合约发送奖励/罚没消息；`tests/PredictionMarket.test.ts` 验证整套流程。
- `contracts/contracts/juror_staking.tact`：陪审员质押与白名单配额管理，接收奖励/罚没消息并记录可领取奖励；`tests/JurorStaking.test.ts` 及预测合约测试一同覆盖。
- `contracts/contracts/tai_oracle.tact`：RedStone 价喂模块，提供 3 日均价与涨幅判断接口；`tests/TaiOracle.test.ts` 验证离群过滤。
- 部署脚本：`contracts/scripts/deployPredictionMarket.ts`、`deployJurorStaking.ts`、`deployTaiOracle.ts` 可直接部署到测试网，运行完成后请把地址写入 `.env` 与 `addresses.json`。

---

## 4. 后端接口速览（按场景）

| 场景 | Endpoint | 说明 | 文件 |
| --- | --- | --- | --- |
| 列出预测 | `GET /api/markets` | 支持 sort/filter/cursor 分页 | `src/server/routes/markets.ts` |
| 创建预测 | `POST /api/markets` | 校验标题、时间、质押、标签 | 同上 |
| 获取详情 | `GET /api/markets/:id` | 聚合赔率、下注、资讯入口 | 同上 |
| 下注 | `POST /api/markets/:id/bets` | 写入 bets 表并触发手续费分配 | 同上 |
| DAO 领取 | `POST /api/dao/claim` | 更新 `dao_pool` 状态为 `claimed` | `src/server/routes/dao.ts` |
| 红包购买 | `POST /api/redpacket/purchase` | 创建订单，待 TON 监听回执 | `src/server/routes/redpacket.ts` |
| 红包支付确认 | TON 支付监听 | 调用 `markPurchaseAwaitingSignature` & `recordPurchasePayout` | `src/server/listeners/tonPayment.ts` |
| 官方雨露列表/领取 | `/api/official` | 数据结构齐，但返回 BOC 占位 | `src/server/routes/official.ts` |
| 邀请统计 | `/api/invite/*` | 目前由 mock 返回数据 | `src/server/routes/invite.ts` |

> 详细字段、错误信息请参考对应服务层 (`src/server/services/*`)；同事若只需要业务理解，可忽略实现细节。

---

## 5. 基础运行与排障（简版）

1. **准备环境**：按 `docs/ENVIRONMENT.md` 填写 `.env`，至少保证 Supabase、TON API、Telegram Token 有值。
2. **启动项目**：
   ```bash
   npm install
   npm run env:check   # 检查必须变量
   npm run dev         # 同时跑前端 (5173) 与后端 (3001/3002)
   ```
3. **常见问题**：
   - 启动时报 `supabaseUrl is required`：检查 `.env` 中是否填写 `SUPABASE_URL` 与 `SUPABASE_SERVICE_KEY`，并确认 `npm run dev:server` 使用了 `--env-file=.env`。
   - 页面空白但控制台正常：确保 Vite 端口 5173 未被拦截，或手动访问 `http://localhost:5173`。
   - Telegram 相关报 404：开发环境使用占位 token 会自动降级成 mock，无需处理；生产需填写真实 Bot Token。

更多部署/运维细节请查看：
  - `docs/HANDOVER_GUIDE.md`（技术向交接）
  - `docs/ENVIRONMENT.md`（环境变量说明）
  - `docs/RUNBOOK_AUTOMATION.md`（自动化任务 runbook）

---

## 6. 当前待办与注意事项

- **数据对接**：邀请榜、鲸鱼榜、DAO 统计等依赖的后端 API 仍是模拟，需要 Supabase 函数与视图支持。
- **链上接入**：红包支付、雨露 BOC、预测结算尚未真正广播到链上；合约部署与 TON Webhook 需后续补齐。
- **自动化监控**：Cron 与支付监听仅输出日志，建议接入告警渠道（Sentry/Telegram 专用群）。
- **安全审查**：`.env.example` 包含大量预留字段，请按实际使用删减，避免运维误配。
- **文案/多语言**：新增按钮或模块需同步更新 `src/locales/en/*` 与 `src/locales/zh/*`。

---

如需进一步支持，可先按照章节定位到对应文件，再与工程团队确认实现细节。祝交接顺利！
