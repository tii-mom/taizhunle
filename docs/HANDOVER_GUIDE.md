# Taizhunle 项目交接手册

> 面向接手团队的技术概览、运行指南与后续规划。请配合同目录下的业务文档（如 `PROJECT_GUIDE.md`、`ENVIRONMENT.md`、`TELEGRAM_BOT_SETUP.md`）一起阅读。

## 1. 项目速览
- **定位**：基于 TON 区块链的预测市场与社区运营平台，包含预测下注、DAO 分账、红包裂变、官方雨露、邀请返利、榜单等功能。
- **技术栈**：
  - 前端：Vite + React 19 + TypeScript，TanStack Query 管理数据，Tailwind +自建 Glass UI 体系，i18next 多语言，TonConnect UI 钱包接入。
  - 后端：Node 20 + Express，Supabase/Postgres 作为主数据源，TON API、Telegram Bot、node-cron 定时任务。
  - 基础设施：Docker（多阶段构建）、Vercel 部署脚本、Railway 配置、Supabase 迁移脚本。
- **核心依赖**：`@tanstack/react-query`, `@supabase/supabase-js`, `@ton/core`, `@tonconnect/ui-react`, `node-telegram-bot-api`, `node-cron`, `express`, `zod`。

## 2. 代码结构总览
| 目录 | 说明 |
| --- | --- |
| `src/main.tsx` | React 入口，挂载全局 Provider、路由以及开屏动画 |
| `src/router.tsx` | 客户端路由，含 Ton 钱包守卫、懒加载页面 | 
| `src/providers/` | `AppProviders`（Query + i18n + 主题 + TonConnect）、`ThemeProvider` |
| `src/components/` | UI 组件库：`glass` 新版玻璃风格、`layout` 旧版布局、业务模块（assets/invite/ranking/...） |
| `src/pages/` | 页面级组件，分为 Glass 新 UI 与保留的传统页面 |
| `src/services/` | 前端 API 封装：markets、invite、ranking、ton、user |
| `src/hooks/` | 自定义 Hook：资产走势、倒计时、Ton 签名、Telegram WebApp 等 |
| `src/server/` | 后端源码：Express 入口、路由、服务层、Ton/Telegram 集成、定时任务 |
| `supabase/` | 数据 schema 与迁移脚本 |
| `scripts/` | 环境检查、迁移、联调工具脚本 |
| `docs/` | 现有说明文档（环境、Telegram、验收报告等） |

## 3. 环境与运行
### 3.1 先决条件
- Node.js 20（Docker、CI 同步此版本）
- npm 10+（项目使用 `npm ci` 保持一致）
- Supabase 项目或本地 Supabase CLI（用于数据库与存储）
- TON API Key（默认使用 Toncenter）、Telegram Bot Token（管理员机器人）

### 3.2 环境变量
- 推荐执行 `npm run setup` 通过交互式脚本生成 `.env`。
- 详情参见 `docs/ENVIRONMENT.md`，核心变量：`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_KEY`、`TON_API_KEY`、`JWT_SECRET`、`TELEGRAM_*` 系列、`REDPACKET_*` 参数等。
- 开发阶段可设 `ENABLE_MOCK_DATA=true` 启用部分 Mock 服务。

### 3.3 数据库（Supabase）
- 初始化/重置：`npx supabase db reset --local` 或 `npm run db:reset`
- 迁移：`npx supabase db push`（脚本 `npm run db:push`）
- Schema 概览见第 7 章。

### 3.4 安装与启动
```bash
npm ci                    # 安装依赖
npm run env:check         # 校验 .env
npm run dev               # 同时启动 Vite(5173) + Express(3000)
# 或
npm run dev:client        # 仅前端
npm run dev:server        # 仅后端（watch 模式）
```
- 生产构建：`npm run build`（TS + Vite + server bundle）
- 生产启动：`npm run start`（运行 `dist/server/main.js`）
- Lint：`npm run lint`

### 3.5 常用脚本
| 指令 | 功能 |
| --- | --- |
| `scripts/setup-env.cjs` | 环境变量向导 | 
| `scripts/check-env.cjs` | 必填变量检测（postinstall 使用） |
| `scripts/run-migration.js` | 自定义迁移执行示例 |
| `scripts/test-db.js` / `test-system.js` | 快速健康检查占位（需按需完善） |
| `scripts/verify-trend-data.ts` | 资产曲线数据校验辅助 |
| `scripts/verifyContracts.js` | 合约配置验证占位 |

## 4. 前端架构
### 4.1 入口与 Provider
- `src/main.tsx` 注入 `SplashScreen`、`AppProviders`、`RouterProvider`。
- `AppProviders` 组合 React Query、i18next、`ThemeProvider`、TonConnect UI；Ton manifest 位于 `public/tonconnect-manifest.json`。

### 4.2 路由与访问控制
- `src/router.tsx` 使用 React Router v7：
  - `TransitionLayout` 提供路由切换动画。
  - `withWalletGuard`：若未连接 Ton 钱包则跳转 `/login`。
  - 页面懒加载：`HomeGlass`, `DaoGlass`, `BetGlass`, `MarketDetailGlass`, `Create`, `Profile`, `SearchGlass`, `Invite`, `Ranking`, `Assets`, `RedPacket*` 等。

### 4.3 UI 体系
- `src/components/glass/`：统一的“玻璃拟态”组件（`GlassPageLayout`、`GlassCard`、`GlassButtonGlass`、`RealtimeProfitBar`、`DaoConsoleGlass`、`MarketCardGlass` 等）。
- 旧版布局仍通过 `src/components/layout/`（`PageLayout`, `BottomNav` 等）服务部分页面。
- Tailwind + 自定义 CSS 变量（`src/styles/glass.css`、`src/index.css`）处理浅/深色模式。

### 4.4 数据访问
- 通过 `src/services/*.ts` 封装 HTTP：
  - `markets.ts`：行情列表、详情、下注、分页加载、React Query 钩子。
  - `rankingService.ts`、`inviteService.ts` 等目前带有 fallback mock，API 未完全落地时返回模拟数据。
  - `tonService.ts`（前端）仅包含 TON 工具函数；实际链上交互走后端。
- Query 定义集中在 `src/queries/`（home feed、market detail、DAO、bet modal 等）。

### 4.5 核心 Hooks
- Ton & 钱包：`useTonWallet.ts`, `useTonSign.ts`
- 数据/动画：`useCountUp`, `usePulseGlow`, `useAssetTrend`, `useAssetData`（带插值逻辑）、`useDynamicOdds`, `useLiveBetting`, `useRedPacketSale`, `useOfficialRain`。
- 终端能力：`useHaptic`, `useTelegramWebApp`（WebApp SDK）
- i18n 包装：`useI18n`

### 4.6 主要页面
- `HomeGlass.tsx`：首页无限滚动预测卡片、过滤器、收藏、DAO 数据条。
- `MarketDetailGlass`/`BetGlass`：详情、下注面板（依赖 `useMarketDetailQuery` 等）。
- `Create.tsx`：预测创建多步骤表单，zod 校验 + 动画（目前提交落地为本地提示）。
- `DaoGlass.tsx`：DAO 控制台，聚合 Supabase 数据、待领取金额展示、收益拆分。
- `Assets.tsx` 系列：资产概览、趋势图（Recharts）。
- `Invite.tsx`：邀请返利仪表盘，复制链接、申请领取（现阶段通过 mock 数据）。
- `Ranking.tsx`：榜单切换（invite/whale/prophet），定时刷新，右侧分享卡片。
- `RedPacketSale.tsx` / `OfficialRain.tsx`：与后端 `/api/redpacket`、`/api/official` 对接，包含倒计时、加速徽章、资格判断。
- `SearchGlass`, `Profile`, `Login` 等辅助页面。
- 所有页面已接入 i18next，文案位于 `src/locales/{en,zh}`。

## 5. 后端架构
### 5.1 启动流程
- `src/server/main.ts`：手动加载 `.env` → 校验必要变量 → 打印摘要 → 启动 Telegram Bot、TON 支付监听、定时任务 → `startServer` 监听端口（带重试与优雅关闭）。
- `src/server/index.ts`：Express 应用，Helmet + CORS（多域配置）、JSON 解析、开发日志、健康检查与配置回显接口、路由注册、错误处理。

### 5.2 配置中心
- `src/config/env.ts`：统一读取/转换 env，导出 `config` 对象（server/database/telegram/ton/business/security/features），并在生产环境执行必填校验。
- 功能开关：`config.features.mockData / priceAdjustment / acceleratePeriod / officialRainCreation`。

### 5.3 API 路由
| 路径 | 描述 | 主要服务 |
| --- | --- | --- |
| `GET /api/markets` | 列表分页、排序、筛选 | `marketService.listMarkets` |
| `GET /api/markets/:id` | 市场详情 / snapshot / odds / live | `marketService` |
| `POST /api/markets/:id/bets` | 创建下注（校验、Supabase 入库、通知、DAO 分账） | `marketService.placeBet` + `feeDistributor` |
| `GET /api/redpacket/status` | 当前红包销售状态（可 fallback mock） | `redpacketService.getCurrentSaleStatus` |
| `POST /api/redpacket/create` | 创建购买会话（生成 memo） | `redpacketService.createPurchaseSession` |
| `POST /api/redpacket/purchase` | 轮询签名/提交签名完成领取 | `redpacketService.getPurchaseForWallet/markPurchaseCompleted` |
| `GET /api/official/next` | 官方雨露排期 | `officialRainService.getNextOfficialRain` |
| `POST /api/official/claim` | 领取官方雨露 | `officialRainService.claimOfficialRain` |
| `GET /api/dao/*` | DAO 待领取金额 / 统计 / 领取 | `feeDistributor` 中的工具函数 |
| `GET /api/whale` | 大户榜（当前为静态示例） | 占位 |

### 5.4 服务层要点
- **Supabase 客户端**：`supabaseClient.ts` 延迟创建（需要 `SUPABASE_SERVICE_KEY`，server 端使用 Service Role）。
- **市场**：查询 `predictions`、`bets`，计算赔率、赏金、收藏；下注时调用 `ensureUserByWallet`、费率分配（`config.PREDICTION_FEE_RATE`）、DAO 分润、Telegram 通知。
- **红包**：`redpacketService` 负责销售周期、加速期、Memo 生成、TON 支付监听同步、用户资产表（`user_balances`）更新。
- **官方雨露**：资格校验（检查历史红包购买）、随机奖励、写入 `official_rain_claims`、更新场次统计。
- **DAO 分配**：`feeDistributor.ts` 计算 basis point，写入 `dao_pool`，`getDaoPoolStats` 汇总；领取时更新状态 + 交易哈希。
- **用户资料**：`userService.ts` 以钱包地址去重，合并 Telegram 信息，调用 `increment_user_bets` RPC（存在时）。
- **TON**：`tonService.ts` 调用 Toncenter API（`getAddressInfo`、`getTransactions`、`checkPayment`、`generatePaymentLink`）。
- **Telegram**：`telegramService.ts` 通过 Bot API 发送消息，`bot/index.ts` 在开发模式可切换 Mock Bot，提供命令（/start、/help、/status、/soldout 等）以及管理员指令占位。

### 5.5 后台任务与监听
- `jobs/priceAdjust.ts`：每日 00:00 调整红包价格（依据昨日销量），写入 `redpacket_sales`。
- `jobs/accelerate.ts`：20:00 启动加速期、00:00 结束（当前仅日志/TODO，需要补数据库 & 通知）。
- `jobs/officialCreate.ts`：每日 12/14/18/22 创建官方雨露（随机金额，TODO：写数据库 & 推送）。
- `listeners/tonPayment.ts`：轮询 Toncenter `getTransactions`，按 Memo 匹配 `redpacket_purchases`，校验金额 → 生成待签名 BOC → 标记 `awaiting_signature` → 更新销量 → 写用户资产。

## 6. 区块链与外部集成
### 6.1 TON 集成
- 前端通过 TonConnect UI 连接钱包、触发签名。
- 后端 `tonService` 与 Toncenter 通信，`tonUtils` 负责地址校验、格式化。
- `TonPaymentListener` 需要 `config.ton.apiEndpoint`、`TON_API_KEY`、`REDPACKET_PAYMENT_ADDRESS`；默认间隔 15s，内存缓存最近 512 笔交易。

### 6.2 Telegram
- 管理员 Bot Token、频道 ID、管理员 ID 由 `.env` 提供。
- `startTelegramBot()` 会在开发环境退回到 `mockBot`，真实环境使用 `node-telegram-bot-api`（Polling/Webhook）。
- `notifyAdmins`、`notifyChannel` 在下注、雨露领取等事件触发。
- `useTelegramWebApp` Hook 支持 Telegram Mini App 场景（尚未在生产链路启用）。

### 6.3 Supabase
- Service key 用于服务端增删改；前端使用 anon key（从 Vite 注入）。
- RLS：部分表启用行级安全，需要确认策略是否满足发布需求（例如 `redpacket_purchases` 当前使用 wallet claim 策略）。
- 物化视图 `mv_user_dao_stats` 需要定时 `refresh_user_dao_stats()`（建议在 Supabase Scheduler 或 Cron 里触发）。

### 6.4 红包支付流程概览
1. 前端请求 `/api/redpacket/create` 获得 memo。
2. 用户向 `REDPACKET_PAYMENT_ADDRESS` 转账指定 TON，附 memo。
3. `TonPaymentListener` 检测交易 → 验证金额 → 生成 unsigned BOC → `markPurchaseAwaitingSignature`。
4. 前端轮询 `/api/redpacket/purchase` 获取 BOC → 用户在 Ton 钱包签名 → 前端回传签名（TODO）。
5. 后端 `markPurchaseCompleted` → 更新销量、用户资产、DAO 池（后续可扩展）。

## 7. 数据模型与迁移
- 主要表：
  - `users`（钱包+Telegram 信息、统计）
  - `predictions`、`bets`（预测市场主体与下注记录）
  - `redpacket_sales`、`redpacket_purchases`、`user_balances`（红包销售/购买/资产）
  - `official_rain`、`official_rain_claims`
  - `dao_pool`（分账记录）、`mv_user_dao_stats`（物化视图）
  - 历史红红包/雨露/大户等辅助表（详见 `supabase/migrations`）
- 触发器：统一 `update_updated_at_column()`，确保 `updated_at` 自动更新时间。
- 迁移脚本按时间序列保存（`001_initial_schema.sql`、`20251030_redpacket.sql` 等）。

## 8. 功能模块现状
| 模块 | 状态 | 备注 |
| --- | --- | --- |
| 预测市场 | ✔️ 核心流程已通，下注写库、费率分配、Telegram 推送 | 需验证 Supabase RPC `increment_user_bets` 是否存在 |
| DAO 控制台 | ✔️ 前端展示 + 基础接口；领取逻辑基于 `dao_pool` | 需补充实际领取交易、刷新物化视图机制 |
| 红包销售 | ⚠️ 后端流程齐全，但签名提交、Ton 代付尚未完全连通 | listener 依赖 Ton API，缺失签名回写调用方 |
| 官方雨露 | ⚠️ 数据结构就绪，`claim` 生成 base64 JSON BOC 占位，后续需接真实合约 | 需要补充门票扣费、链上发放 |
| 邀请 / 榜单 / 资产 | ⚠️ 前端完成，接口仍使用 mock 或容错逻辑 | 待后端补齐真实 API |
| Telegram Bot | ⚠️ 命令齐全但大部分为 TODO，需要结合数据库实现实际动作 |
| 定时任务 | ⚠️ priceAdjust 已写库；accelerate/officialCreate 仅日志 | 需补齐 Supabase 更新与通知 |
| 测试 | ❌ 尚无单元/集成测试 | 建议补充至少服务层单测与关键接口 e2e |

## 9. 部署与运维
- **打包**：`npm run build` （先 TS 构建，再 Vite，再 server bundle）
- **Docker**：多阶段构建，builder 安装全部依赖 → `npm run build` → runner 仅保留生产依赖并执行 `npm run start`。Expose 3000/5173。
- **docker-compose**：单服务示例，同时暴露前后端端口（注意环境变量名与 `.env` 对齐）。
- **Vercel**：`npm run deploy` → `vercel --prod`，`vercel.json` 使用静态构建策略（后端需要额外配置或使用 Serverless 函数）。
- **Railway**：`railway.toml` 定义 web(5173)/api(3000) 服务。
- **监控/日志**：当前仅 stdout；建议接入 Sentry（`SENTRY_DSN` 预留）、日志聚合。
- **Cron 任务**：由应用内 node-cron 执行，部署时需确保单实例或加锁，避免重复执行。

## 10. Mock 与功能开关
- `.env` 的 `ENABLE_MOCK_DATA=true` 时部分接口回退到 `src/server/services/mockRedpacketService`。
- 多个前端服务在请求失败时返回模拟数据：`inviteService`, `rankingService`, `useAssetData`。
- 功能开关集中在 `config.features` 与前端 `VITE_ENABLE_*` 变量。

## 11. 已知问题 & 建议
1. **签名回传链路**：`/api/redpacket/purchase` 对签名的处理仅调用 `markPurchaseCompleted`，未实际广播交易；需结合 TON 钱包流程补完。
2. **加速期/官方雨露定时任务**：目前仅日志，需要落地 Supabase 更新、消息通知并防止重复执行。
3. **邀请/榜单/鲸鱼数据**：后端缺实现，前端使用 mock。建议优先落地 API，或在前端显式标记“开发中”。
4. **物化视图刷新**：`mv_user_dao_stats` 未自动刷新，可在 Supabase Edge Function 或 cron 任务中调用 `refresh_user_dao_stats()`。
5. **错误处理**：部分服务吞错误或仅打印（如 `upsertUserBalance`），建议补充告警/重试。
6. **测试缺失**：目前无自动化测试，推荐优先覆盖 `marketService`, `redpacketService`, `tonPaymentListener` 等关键模块。
7. **环境变量覆盖**：`docker-compose.yml` 中的变量名（如 `SUPABASE_KEY`）与代码期望的 `SUPABASE_ANON_KEY/SUPABASE_SERVICE_KEY` 不一致，需要统一。
8. **安全性**：`loadEnv` 会在 `.env` 缺失时报错退出，生产环境仍需通过部署策略保证密钥安全；同时注意 Service Key 仅在后端使用。

## 12. 参考文档
- `docs/ENVIRONMENT.md`：环境变量清单与获取方式。
- `docs/TELEGRAM_BOT_SETUP.md`：Telegram Bot 配置与调试。
- `docs/DAO_V2_IMPLEMENTATION.md`、`DAO_INSERT_GUIDE.md`：DAO 相关设计。
- `docs/CURRENT_STATUS.md`、`FINAL_DELIVERY.md`：阶段性进度总结。
- `docs/PROJECT_GUIDE.md`：产品/运营视角说明。
- `supabase/schema.sql`、`supabase/migrations/`：数据库结构历史。

## 13. 下一步建议
1. **补齐未完成模块**：实现真实的邀请、榜单、鲸鱼 API；完善 Telegram 命令逻辑。
2. **完善链上交互**：将红包签名流程与链上合约连接，明确交易广播与状态回写机制。
3. **监控与告警**：为 Ton 支付监听、定时任务、Telegram 推送等关键路径增加告警（Sentry/Slack）。
4. **测试与 CI**：搭建基础测试框架（Vitest/Jest + Supertest），配置 GitHub Actions 或类似管道。
5. **文档与 Runbook**：为运维动作（刷新物化视图、手动补单）写详细 Runbook，补充到 `docs/`。
6. **数据一致性**：梳理 Supabase 权限策略、触发器、物化视图刷新频率，确保 DAO 收益等统计准确。

---
如有进一步问题，可先查阅 `docs/` 下的专项文档或联系上任维护人获取 Supabase、TON、Telegram 相关访问权限。
