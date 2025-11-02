# Taizhunle（太准了）项目说明

## 📋 项目概述
**Taizhunle（太准了）** 聚焦于 TON 区块链的预测市场与红包分发场景，仓库同时维护：
- **React 前端**：玻璃拟态（Glass）界面、国际化、TonConnect 钱包接入与预测市场交互体验。
- **Node.js/Express 服务端**：负责红包购买流程、TON 支付监听、Supabase 数据存储、Telegram Bot 与定时任务。
- **Tact 智能合约**：实现 TAI 主代币与锁仓/释放逻辑，配套脚本用于部署与一致性校验。

**当前源码状态**
- 源码版本：`package.json` → `0.0.0`
- 健康检查默认版本号：`src/server/index.ts:50` → `1.0.0`
- 最近主要更新：2025-11-01（见 `CHANGELOG.md`）
- 代码规模：约 13,484 行 TypeScript（151 个 TS/TSX 文件）+ 191 行 Tact（2 份合约）
- 运行拓扑：Vite 前端静态资源 + Express 服务 + TON 智能合约 + Supabase/Postgres

---

## 🛠 技术栈

### 前端
- **React 19.1.1** / **TypeScript 5.9.3**
- **Vite 7.1.7** + **Tailwind CSS 3.4.15** + **PostCSS/Autoprefixer**
- **@tanstack/react-query 5.90.5**：服务端状态与无限加载
- **React Router 7.9.4**：前端路由与导航守卫
- **react-hook-form 7.65.0** + **Zod 4.1.12**：表单和校验
- **i18next 25.6.0** / `react-i18next`：18 个命名空间的中英双语
- **@tonconnect/ui-react 2.3.1**：TonConnect 钱包集成
- **Framer Motion 12.23.24** / **lucide-react**：动画与图标

### 服务端
- **Node.js 20+ / Express 4.21.2**（`src/server/index.ts`）
- **Supabase JS 2.76.1**：数据库访问（懒加载客户端 `src/server/services/supabaseClient.ts`）
- **node-cron 3.0.3**：价格调整、加速期、官方雨露任务（`src/server/jobs/`）
- **node-telegram-bot-api 0.66.0**：管理员 & 用户 Bot（支持 Mock）
- **dotenv 17.2.3**：环境变量加载（结合自定义 `loadEnv`）
- **Helmet / CORS / Express JSON**：服务端基础中间件

### 智能合约与 TON
- **Tact**：`contracts/contracts/t_a_i_master.tact`、`vesting_contract.tact`
- **@ton/core 0.62.0**：监听器与 BOC 构建
- **@ton/blueprint / @ton/test-utils / @ton-community/func-js**：部署、测试与编译
- **仓库脚本**：`contracts/scripts/deployAll.ts`、`scripts/verifyContracts.js`

### 工具链与规范
- **ESLint 9.38.0** + **@typescript-eslint 8.46.2** + **Prettier 3.6.2**
- **Tailwind / PostCSS 配置**：`tailwind.config.js`, `postcss.config.js`
- **Concurrently / tsx**：双端启动、TS 编译执行
- **自定义脚本**：`scripts/setup-env.cjs`, `scripts/check-env.cjs`

---

## 📁 项目结构

```
taizhunle/
├── src/
│   ├── app/                     # 应用壳层（App.tsx 等）
│   ├── web/pages/               # 玻璃拟态首页、详情页（HomeGlass 等）
│   ├── components/
│   │   ├── glass/               # Glass UI 组件（MarketCardGlass 等）
│   │   └── common/              # 通用展示组件
│   ├── hooks/                   # 自定义 Hook（useRedPacketSale, useTonWallet 等）
│   ├── queries/                 # React Query 查询配置（homePageQuery 等）
│   ├── services/                # 前端数据层（markets mock、userService 占位）
│   ├── config/                  # 环境变量封装（env.ts）
│   ├── providers/               # 全局 Provider（React Query、TonConnect）
│   ├── server/                  # Node/Express 服务端
│   │   ├── routes/              # REST 路由（redpacket、official、whale、dao*）
│   │   ├── services/            # Supabase 访问、红包逻辑、feeDistributor 等
│   │   ├── listeners/           # TON 支付监听（tonPayment.ts）
│   │   ├── jobs/                # 定时任务（priceAdjust/accelerate/officialCreate）
│   │   ├── bot/                 # Telegram Bot（真实 + Mock）
│   │   └── utils/constants      # 工具与常量
│   ├── locales/                 # i18n 资源
│   ├── utils/ | lib/            # 工具函数与图标封装
│   └── styles/                  # 全局样式
├── contracts/                   # Tact 合约工程（需单独安装依赖）
│   ├── contracts/               # t_a_i_master.tact / vesting_contract.tact
│   ├── scripts/                 # 地址推导、部署、验证脚本
│   └── tests/                   # 合约测试样例
├── supabase/                    # 数据库迁移与 Schema（PostgreSQL）
├── docs/                        # 项目文档（ENVIRONMENT、CURRENT_STATUS 等）
├── scripts/                     # 环境变量工具、合约校验
├── addresses.json               # 最新合约地址与配置快照
├── Dockerfile / docker-compose.yml / vercel.json / railway.toml
└── README.md / PROJECT_GUIDE.md / DEPLOYMENT.md 等
```

---

## 🎯 核心模块

### 1. Glass 前端体验
- `src/web/pages/HomeGlass.tsx` 结合 `react-query` 无限滚动（`src/queries/homePage.ts`）与本地 mock 源（`src/services/markets.ts`），实现排序、筛选、收藏、追踪池等交互。
- 玻璃拟态组件位于 `src/components/glass/`，配合 Tailwind 主题在 `src/providers/ThemeProvider.tsx` 中切换暗/亮模式。
- TonConnect 钱包在 `src/providers/AppProviders.tsx` 初始化，自动传入国际化语言与主题；表单、动画、手势均使用 Hooks（`useTonSign`, `useCountDown`, `usePulseGlow` 等）。

### 2. 红包系统（服务端 + 前端）
- REST 路由 `src/server/routes/redpacket.ts` 暴露：
  - `GET /api/redpacket/status`
  - `POST /api/redpacket/create`
  - `POST /api/redpacket/purchase`
  在开发模式且 `ENABLE_MOCK_DATA=true` 时自动切换为 `src/server/services/mockRedpacketService.ts`。
- 真实服务 `src/server/services/redpacketService.ts` 基于 Supabase 表 `redpacket_sales`、`redpacket_purchases`、`user_balances`，生成 memo、会话与 BOC 签名 payload，并汇总销量统计。
- TON 支付流程通过 `src/server/listeners/tonPayment.ts` 轮询 Toncenter：提取 memo → 校验 TON 金额 → 生成 base64 unsigned BOC → 标记 Supabase 状态为 `awaiting_signature`。
- 前端 Hooks `src/hooks/useRedPacketSale.ts`、`src/hooks/useTonSign.ts`、页面 `src/pages/RedPacketSale.tsx` 提供倒计时、加速期徽章与购买弹窗等体验。

### 3. 官方雨露与鲸鱼播报
- `src/server/routes/official.ts` 当前返回 stub 数据并校验参数；配套 Hook `useOfficialRain` 与页面 `src/pages/OfficialRain.tsx` 展示倒计时、资格徽章、门票价格。
- `src/server/routes/whale.ts` 提供鲸鱼榜样例数据；前端排行榜组件位于 `src/components/market/` 与 `src/pages/Ranking.tsx`。
- 定时任务 `src/server/jobs/officialCreate.ts` 拟定每日 4 次的雨露生成流程，后续需补充数据库写入与通知。

### 4. DAO 分润与预测市场
- 服务端 `src/server/services/feeDistributor.ts` 定义 DAO 池拆账比例、Supabase 插入逻辑，以及 `/api/dao/*` 路由（`src/server/routes/dao.ts`）。目前 DAO 路由未在 `src/server/index.ts` 挂载，需要手动接入。
- 数据层依赖视图 `mv_user_dao_stats` 与表 `dao_pool`（见 `supabase/migrations/20251101_dao_pool.sql`）。
- 前端预测市场仍基于 mock 数据，后续需对接真实 API 及 DAO 分润接口。

### 5. TON 集成
- TON 配置集中在 `src/config/env.ts`，可切换网络/合约地址/平台钱包。
- 红包支付监听 `src/server/listeners/tonPayment.ts` 使用 `@ton/core` 组装 `RPAY` payload，并调用 `markPurchaseAwaitingSignature`、`recordPurchasePayout` 更新 Supabase。
- 合约部署脚本 `contracts/scripts/deployAll.ts` + `scripts/verifyContracts.js` 用于推导 deterministic 地址、核验 `addresses.json` 中的 stateInit/供应量。

### 6. Telegram Bot
- `src/server/bot/index.ts` 根据环境决定使用真实 Bot 或 `mockBot`。提供 `/status`、`/soldout`、`/next` 等用户命令以及管理员命令（`/price`, `/accelerate`, `/approve`, `/reject`, `/settle`）。
- 权限由 `TELEGRAM_ADMIN_IDS` 控制，频道成员校验通过 `getChatMember`；正式环境需补充 Webhook 配置（见 `docs/TELEGRAM_BOT_SETUP.md`）。

---

## 📡 API 速览
- `GET /health`：健康检查，返回版本、环境、特性开关。
- `GET /api/config`（仅开发）：打印当前配置摘要。
- `GET /api/redpacket/status`：返回价格、销量、是否加速期等。
- `POST /api/redpacket/create`：校验 TON 地址并生成购买会话（地址、memo、到期时间）。
- `POST /api/redpacket/purchase`：查询 Memo 对应订单，返回未签名 BOC，或提交签名完成订单。
- `GET /api/official/next` / `POST /api/official/claim`：官方雨露时间与领取占位实现。
- `GET /api/whale`：鲸鱼榜示例数据。
- `/api/dao/*` 路由已实现但尚未在服务器入口注册，接入后可提供 DAO 待领取金额/统计/提现。

---

## 🔧 环境变量与配置
- `.env.example` 提供 299 行模板，`npm run setup`（`scripts/setup-env.cjs`）支持交互式写入关键变量。
- 必填项（`scripts/check-env.cjs` 与 `src/server/main.ts` 会校验）：
  - `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_KEY`
  - `TELEGRAM_ADMIN_BOT_TOKEN` / `TELEGRAM_ADMIN_IDS` / `TELEGRAM_CHANNEL_ID`
  - `TON_API_KEY` / `TON_NETWORK` / `TON_API_ENDPOINT`
  - `JWT_SECRET` / `ENCRYPTION_KEY`
- 业务参数：`REDPACKET_PRICE_TON`, `REDPACKET_BASE_AMOUNT`, `REDPACKET_MAX_AMOUNT`, `ENABLE_MOCK_DATA`, `ENABLE_PRICE_ADJUSTMENT`, `ENABLE_ACCELERATE_PERIOD`, `ENABLE_OFFICIAL_RAIN_CREATION` 等。
- 推荐流程：
  1. `npm run setup` 生成 `.env`
  2. 根据需求补充 `.env.example` 中其他功能开关
  3. `npm run env:check` 验证必填项与格式
  4. 启动服务端前确认 Supabase、TON、Telegram 凭证均已配置

---

## 🗄️ 数据库（Supabase / PostgreSQL）
- 迁移位于 `supabase/migrations/`：
  - `001_initial_schema.sql`：`users`, `predictions`, `bets`, `redpacket_*`, `official_rain` 等核心表
  - `20251030_redpacket.sql` 及后续文件：补充红包销售、DAO 池与日常修正
- 主要结构：
  - `redpacket_sales` / `redpacket_purchases` / `user_balances`：红包销售流水与用户余额
  - `dao_pool` / `mv_user_dao_stats`：DAO 分润明细与物化视图
  - `official_rain` / `official_rain_claims`：官方雨露（待完善）
- `scripts/check-env.cjs` 与服务端启动会在缺少关键连接参数时直接退出。

---

## 🚀 开发与运行
```bash
# 安装依赖（根目录）
npm install

# 一键启动前端 + 服务端
npm run dev

# 独立启动
npm run dev:client      # Vite 开发服务器 (默认 5173)
npm run dev:server      # tsx + Express + Bot + 定时任务 (默认 3000)

# 构建与产物
npm run build           # tsc -b + vite build + server tsc
npm run build:client
npm run build:server

# 工具
npm run env:check       # 检查必填环境变量
npm run lint            # ESLint 校验
```

---

## 🧾 智能合约工作流
```bash
cd contracts
npm install                     # 首次需安装合约依赖
npx tact compile                # 编译 TAI Master / Vesting 合约
npx tact test                   # 运行 Tact 测试
node scripts/deployAll.ts       # 部署 TAIMaster + Vesting（需配置密钥）
node ../scripts/verifyContracts.js  # 回到仓库根目录验证 addresses.json
```
- 部署成功后更新 `addresses.json` 并提交审计记录。
- `scripts/verifyContracts.js` 会对管理地址、stateInit、供应量与首轮价格做一致性检查。

---

## 📦 部署参考
- 详见 `DEPLOYMENT.md` / `docs/ENVIRONMENT.md`。
- 前端可部署到 Vercel/Netlify/Cloudflare Pages，后端可运行于 Railway/Fly/自建 VPS 或 Docker Compose。
- 生产环境务必：
  - 关闭 `ENABLE_MOCK_DATA`
  - 为 Telegram Bot 配置 Webhook（或持久化轮询）
  - 提供 Supabase Service Key、TON 钱包私钥等安全存储
  - 运行 `npm run build && npm start` 或 `node dist/server/main.js`

---

## 📌 当前状态与后续任务
- [ ] 将前端预测市场与 DAO 模块接入真实后端/数据库接口，替换 mock 数据。
- [ ] 在 `src/server/index.ts` 挂载 `/api/dao` 路由并补齐 Supabase 读写与校验。
- [ ] 为红包、官方雨露、TON 监听编写集成测试与错误告警。
- [ ] 完成定时任务（priceAdjust/accelerate/officialCreate）对 Supabase 的实际读写与 Telegram 推送。
- [ ] 梳理 `.env.example` 与真实依赖项，去除冗余字段并补充文档说明。
- [ ] 明确许可证与维护人信息，完善 CI/CD（当前仓库未附带工作流脚本）。

---

## 📞 支持与协作
- 维护者：待补充
- 联系方式：待补充（可参考仓库 Issue / Telegram 群）
- 参考文档：`docs/ENVIRONMENT.md`, `docs/TELEGRAM_BOT_SETUP.md`, `DEPLOYMENT.md`

---

## 📄 许可证
尚未在仓库中声明，请在发布前补充。

---

**最后更新**：2025-11-01  
**对应版本**：源码 `0.0.0`（健康检查输出 `1.0.0`）  
**本次更新要点**：
- 对齐真实端点（`/api/redpacket/*`、`/api/official/*` 等）与 Supabase 工作流。
- 补充 Glass 前端、TON 监听、Telegram Bot、DAO 服务等模块说明。
- 更新环境变量、数据库、部署与后续计划，清理过时数字与流程描述。
