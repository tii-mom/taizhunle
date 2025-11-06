# Taizhunle（太准了）项目说明

## 📋 项目概述
**Taizhunle（太准了）** 聚焦于 TON 区块链的预测市场、红包分发与 Telegram 社群运营，仓库同时维护：
- **React/Vite 前端**：玻璃拟态界面、React Query 数据层、TonConnect 钱包集成、多语言支持。
- **Node.js/Express 服务端**：Supabase 数据访问、预测市场/红包/官方雨露 API、TON 支付监听、Telegram Bot 及定时任务。
- **Tact 智能合约**：TAI 主代币与锁仓逻辑，配套部署/验证脚本与地址快照。

**当前源码状态**
- 源码版本：`package.json` → `0.0.0`
- 健康检查版本：`src/server/index.ts` → `1.0.0`
- 最近主要提交：2025-11-02 `2f02d4f`（chore: Remove sensitive files from git tracking）
- 最新里程碑：`CHANGELOG.md` → `3.0.0 / 2025-10-27`
- 代码规模：14,558 行 TypeScript（156 个 TS/TSX 文件）+ 191 行 Tact 合约
- 运行拓扑：Vite SPA → Express API → Supabase/Postgres → TON 合约 & Telegram Bot

---
## 🛠 技术栈

### 前端
- **React 19.1.1** / **TypeScript 5.9.3** / **Vite 7.1.7**
- **Tailwind CSS 3.4.15** + **PostCSS/Autoprefixer**
- **@tanstack/react-query 5.90.5**：数据获取与缓存
- **react-router-dom 7.9.4**：路由与守卫
- **react-hook-form 7.65.0** + **Zod 4.1.12**：表单 & 校验
- **i18next 25.6.0** + **react-i18next 16.2.0**：多语言
- **@tonconnect/ui-react 2.3.1**：TonConnect 钱包
- **Framer Motion 12.23.24** / **lucide-react 0.548.0**：动画与图标

### 服务端
- **Node.js 20+ / Express 4.21.2**
- **@supabase/supabase-js 2.76.1**：数据库访问（`src/server/services/supabaseClient.ts` 延迟初始化）
- **marketService / officialRainService / userService / telegramService**：预测市场、官方雨露、用户档案与通知逻辑
- **node-cron 3.0.3**：定时任务（价格调整、加速期、官方雨露）
- **node-telegram-bot-api 0.66.0**：管理员 & 用户 Bot
- **helmet 8.1.0** / **cors 2.8.5** / 原生 JSON 解析中间件

### 智能合约与 TON
- **Tact**：`contracts/contracts/t_a_i_master.tact`, `vesting_contract.tact`
- **@ton/core 0.62.0**：BOC 生成与监听
- **@tonconnect/ui-react**：前端钱包连接
- **Ton 支付监听器**：`src/server/listeners/tonPayment.ts` 轮询 toncenter API
- **解锁 & 白名单方案**：详见 `docs/UNLOCK_WHITELIST_PLAN.md`，记录 20/30 亿分配、质押白名单公式、稳定币储备池与 RedStone 预言机

### 工具链与规范
- **ESLint 9.38.0** + **@typescript-eslint 8.46.2** + **Prettier 3.6.2**
- **tsx 4.20.6** / **concurrently 9.2.1**：服务端热重载与并行启动
- **脚本**：`scripts/setup-env.cjs`, `scripts/check-env.cjs`, `scripts/run-migration.js`, `scripts/test-system.js`, `scripts/verifyContracts.js`

---
## 📁 项目结构

```
taizhunle/
├── src/
│   ├── app/                     # 应用壳层（App.tsx -> HomeGlass）
│   ├── pages/                   # 资产、DAO、邀请、搜索等页面
│   ├── web/pages/               # 玻璃拟态主屏（HomeGlass、BetGlass、MarketDetailGlass 等）
│   ├── components/
│   │   ├── glass/               # Glass UI 组件
│   │   └── common/              # 通用 UI（Skeleton、Transitions）
│   ├── hooks/                   # useDynamicOdds、useRedPacketSale、useOfficialRain 等
│   ├── queries/                 # React Query 查询定义
│   ├── services/                # 前端数据访问封装（markets、ranking、tonService 等）
│   ├── providers/               # 全局 Provider（TonConnect、React Query、I18n）
│   ├── config/                  # 环境变量封装（env.ts）
│   ├── server/                  # Express 服务端
│   │   ├── routes/              # redpacket、official、markets、dao、whale
│   │   ├── services/            # Supabase、预测市场、官方雨露、Telegram、DAO 等
│   │   ├── jobs/                # priceAdjust / accelerate / officialCreate
│   │   ├── listeners/           # TON 支付轮询
│   │   ├── bot/                 # Telegram Bot 实现
│   │   ├── constants/           # 业务常量
│   │   ├── types/               # Supabase 类型定义
│   │   └── utils/               # TON 地址、日志等工具
│   ├── locales/                 # i18n 资源包
│   ├── lib/ | utils/ | styles/  # 通用库、工具函数、全局样式
│   └── router.tsx / i18n.ts     # 路由与国际化入口
├── contracts/                   # Tact 合约工程（contracts / scripts / tests）
├── supabase/                    # SQL 迁移与种子文件
├── scripts/                     # 环境、数据库、验证与系统测试脚本
├── docs/                        # ENVIRONMENT、CURRENT_STATUS、TELEGRAM_BOT_SETUP 等
├── addresses.json               # 合约地址快照
├── Dockerfile / docker-compose.yml / vercel.json / railway.toml
└── README.md / PROJECT_GUIDE.md / DEPLOYMENT.md 等
```

---
## 🎯 核心模块

### 1. Glass 预测市场体验
- `src/web/pages/HomeGlass.tsx` 聚合市场卡片、动态动画与无限滚动（依赖 `src/queries/homePage.ts` 和 React Query）。
- `src/router.tsx` 使用 TonConnect 钱包守卫，结合 `PageTransition` 与 `PageSkeleton` 实现路由动画与懒加载，并可从 `?ref=`/`?inviter=` URL 参数写入推荐人缓存。
- `src/components/glass/BetModalGlass.tsx` 引入 `useBetExecutor`（`src/hooks/useBetExecutor.ts`），下注默认调用 `/api/markets/:id/bets`，自动附带 TonConnect 钱包地址与本地推荐人信息，同时提供 YES/NO 切换、错误提示与提交态管理。
- `src/web/pages/MarketDetailGlass.tsx`、`BetGlass.tsx` 展示市场详情与弹窗，搭配 `useMarketDetailQuery` 等真实 API 查询。

### 2. 资产与发放模块
- `src/pages/Assets.tsx` 作为资产中心，聚合红包销售 (`RedPacketSale`)、官方雨露 (`OfficialRain`) 等子模块。
- `src/hooks/useRedPacketSale.ts` 与 `src/server/routes/redpacket.ts` 组合 Supabase 数据与本地 Mock 回退，保障开发态可演练。
- `src/hooks/useOfficialRain.ts` 对接 `src/server/services/officialRainService.ts`，实时显示下一轮雨露与领取状态。

### 3. DAO 与收益分配
- `src/pages/DaoGlass.tsx` 读取用户 DAO 待领取、统计与排行榜。
- 服务端 `src/server/routes/dao.ts` + `src/server/services/feeDistributor.ts` / `getUserDaoStats` / `claimDaoPool` 负责 DAO 池入账与提现。
- Supabase 侧依赖 `dao_pool`、`official_rain_claims`、`mv_user_dao_stats` 等表/视图维持收益数据。

### 4. 服务端与数据层
- `src/server/services/marketService.ts` 提供市场列表/详情/赔率/实时投注/下注写入，统一封装格式化、Supabase 交互与 Telegram 通知。
- `src/server/services/userService.ts` / `telegramService.ts` / `officialRainService.ts` 处理用户画像、管理员推送、官方雨露资格判定与发放。
- `src/server/services/supabaseClient.ts` 延迟创建 Supabase Service Key 客户端，避免开发环境重复初始化。
- 所有路由集中在 `src/server/index.ts`，已挂载 `/api/markets`、`/api/redpacket`、`/api/official`、`/api/dao`、`/api/whale`。

### 5. 后台任务与监听
- 定时任务：`src/server/jobs/priceAdjust.ts`, `accelerate.ts`, `officialCreate.ts` 根据配置启停。
- TON 支付监听：`src/server/listeners/tonPayment.ts` 轮询 toncenter API，按 Memo 匹配红包订单并生成 BOC。
- Telegram Bot：`src/server/bot/` 保留管理员命令、Mock 适配与自动通知能力。

---
## 📡 API 速览
- `GET /health`：健康检查（版本、环境、功能开关）。
- `GET /api/config`（开发模式）：输出当前配置摘要与关键开关。
- `GET /api/markets`：预测市场列表，支持 `sort`/`filter`/`cursor`/`limit`；返回 `items`+`nextCursor`。
- `GET /api/markets/:id` / `:id/snapshot` / `:id/odds` / `:id/live`：市场详情、下注快照、赔率与实时投注。
- `POST /api/markets/:id/bets`：下注下单，写入 Supabase、分润 DAO、推送 Telegram。
- `GET /api/redpacket/status`：红包销售状态，自动回退 Mock。
- `POST /api/redpacket/create`：校验 TON 地址并创建购买会话；`POST /api/redpacket/purchase` 完成签名或返回待签名 BOC。
- `GET /api/official/next` / `POST /api/official/claim`：官方雨露下一轮与领取。
- `GET /api/dao/stats/:userId` / `pending/:userId` / `pool-stats` / `POST /api/dao/claim`：DAO 统计、待领取金额、池子汇总与提现。
- `GET /api/whale`：鲸鱼榜样例数据。

---
## 🔧 环境变量与配置
- `.env.example` 提供 299 行模板，可通过 `npm run setup`（`scripts/setup-env.cjs`）交互式写入基础变量。
- 关键校验脚本：`npm run env:check` / `npm run env:validate`（`scripts/check-env.cjs`），`node scripts/test-system.js` 可一键验证本地服务与 Supabase 连接。
- 必填变量（生产环境会严格检查）：`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `TON_API_KEY`, `JWT_SECRET`, `TELEGRAM_ADMIN_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS`。
- 业务配置：`REDPACKET_PRICE_TON`, `REDPACKET_BASE_AMOUNT`, `REDPACKET_MAX_AMOUNT`, `PREDICTION_FEE_RATE`, `ENABLE_MOCK_DATA`, `ENABLE_PRICE_ADJUSTMENT`, `ENABLE_ACCELERATE_PERIOD`, `ENABLE_OFFICIAL_RAIN_CREATION` 等。
- 推荐流程：
  1. `npm run setup` 生成 `.env` 基本面；
  2. 根据 `.env.example` 补充 TON/Telegram/Supabase 真实凭证；
  3. 运行 `npm run env:check` + `node scripts/test-system.js` 验证配置；
  4. 启动服务前确认 Supabase Service Key、Ton API Key 与 Telegram Bot 均有效。

---
## 🗄️ 数据库（Supabase/PostgreSQL）
- 迁移位于 `supabase/migrations/`：
  - `001_initial_schema.sql`：`users`, `predictions`, `bets`, `redpacket_*`, `official_rain` 等基础表。
  - `20251030_redpacket.sql`：补充红包销售流水。
  - `20251101_dao_pool.sql` / `20251101_day1_redpacket.sql` / `20251101_day1_redpacket_fix.sql`：DAO 池、雨露修正与首日补丁。
- 关键结构：
  - `predictions` / `bets`：预测市场主体与下注记录。
  - `redpacket_sales` / `redpacket_purchases`：红包销售与支付流水。
  - `official_rain` / `official_rain_claims`：官方雨露排期与领取。
  - `dao_pool` / `mv_user_dao_stats`：DAO 分润明细与用户物化视图。
  - `increment_user_bets` RPC（可选）：支撑下注次数、金额统计。
- Supabase Service Key 由 `src/server/services/supabaseClient.ts` 创建单实例客户端，所有服务端查询/写入需依赖该配置。

---
## 🚀 开发与运行
```bash
# 安装依赖
npm install

# 前后端同时启动（Vite 5173 + Express 3000）
npm run dev

# 独立启动
npm run dev:client           # Vite
npm run dev:server           # tsx 监视 src/server/main.ts

# 构建与运行
npm run build                # tsc -b + vite build + server TS 编译
npm run build:client
npm run build:server
npm start                    # node dist/server/main.js

# 工具
npm run env:check            # 校验必填环境变量
npm run lint                 # ESLint
node scripts/test-system.js  # 本地环境巡检
npx tsx scripts/seed-predictions.ts # 向 Supabase 写入示例预测/下注数据
npm run db:reset             # supabase db reset --local
npm run db:push              # 同步最新迁移
```

---
## 🧾 智能合约工作流
```bash
cd contracts
npm install                        # 首次安装合约依赖
npx tact compile                   # 编译 TAI Master / Vesting
npx tact test                      # 运行 Tact 测试
node scripts/deployAll.ts          # 部署 TAIMaster + Vesting（需配置私钥）
node ../scripts/verifyContracts.js # 在仓库根校验 addresses.json
```
- 部署后更新 `addresses.json` 并同步审计记录。
- `scripts/verifyContracts.js` 会校验管理地址、stateInit、供应量与初始价格。
- `docs/UNLOCK_WHITELIST_PLAN.md` 描述了解锁后白名单认购、USDC 储备池与暴跌回购流程，是规划链上实现的唯一来源。

---
## 📦 部署参考
- 详细说明见 `DEPLOYMENT.md`、`docs/ENVIRONMENT.md`、`docs/TELEGRAM_BOT_SETUP.md`。
- 前端可部署到 Vercel/Netlify/Cloudflare Pages；服务端可运行于 Railway/Fly/VPS 或 Docker Compose。
- 生产注意事项：
  - 禁用 `ENABLE_MOCK_DATA`，确保使用真实 Supabase/TON 凭证。
  - Telegram Bot 建议配置 Webhook 或持久化轮询，管理员/频道 ID 须匹配生产群。
  - 执行 `npm run build && npm start` 或以 Docker/PM2 方式托管。
  - 将 Service Key、私钥、安全密钥存放于密钥管理服务。

---
## 📌 当前状态与后续任务
- [ ] 将预测市场下注流程接入链上合约/签名流程，替换纯数据库记账与 Telegram 通知。
- [ ] 为官方雨露领取提供真实转账或分发机制，替换随机 BOC & bonus 生成逻辑并校验额度。
- [ ] 在 Supabase 启用 RLS/Edge Functions，并补全 `increment_user_bets` 等 RPC，避免服务端警告。
- [ ] 为红包、官方雨露、预测市场撰写端到端测试与错误告警，覆盖关键 happy-path 与异常路径。
- [ ] 梳理 `.env.example` 与文档，提供最小生产配置清单与示例值。
- [ ] 建立 CI（lint/build/API 冒烟）与部署后回归检查，确保主分支始终可发布。

---
## 📞 支持与协作
- 维护者：待补充
- 联系方式：待补充（可通过仓库 Issue 或 Telegram 群）
- 参考文档：`docs/ENVIRONMENT.md`, `docs/TELEGRAM_BOT_SETUP.md`, `DEPLOYMENT.md`, `FINAL_DELIVERY.md`

---
## 📄 许可证
尚未声明，请在正式发布前补充。

---
**最后更新**：2025-11-02  
**对应版本**：源码 `0.0.0`（健康检查返回 `1.0.0`）  
**本次更新要点**：
- 同步 `/api/markets`、`officialRainService`、`marketService` 等最新后端实现说明。
- 更新项目结构与核心模块，纳入 DAO/雨露/下注流程的新代码。
- 重写环境变量、数据库与后续任务，标记仍需落实的链上与生产化工作。
