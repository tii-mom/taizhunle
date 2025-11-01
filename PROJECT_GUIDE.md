# Taizhunle（太准了）项目说明

## 📋 项目概述

**Taizhunle（太准了）** 是一个围绕 TON 区块链构建的去中心化预测市场与红包分发平台。仓库包含三个主要子系统：
- **React 前端**：提供市场浏览、资产看板、红包购买等交互界面，并通过 TonConnect 与链上钱包打通。
- **Node.js/Express 服务端**：承担红包售卖、TON 支付监听、Supabase 数据存储、Telegram Bot 通知与计划任务。
- **Tact 智能合约**：定义 TAI 主代币与锁仓释放逻辑，为平台发行与结算提供链上基础。

- **当前版本**：v1.0.0
- **发布日期**：2025-01-31
- **核心里程碑**：完成红包售卖后端 API、TON 支付监听、Supabase 数据层、智能合约部署校验，以及多语言前端体验。
- **代码规模**：约 8,900 行 TypeScript（108 个 TS/TSX 文件）+ 2 份 Tact 合约
- **部署形态**：前端静态站点 + Node 服务（Express）+ TON 智能合约 + Supabase 数据库

---

## 🛠 技术栈

### 前端
- **React 19.1.1** / **TypeScript 5.9.3**：单页应用与严格类型支持
- **Vite 7.1.7**：本地开发与打包
- **Tailwind CSS 3.4.15**：主题化原子样式
- **@tanstack/react-query 5.x**：服务端状态缓存
- **React Router 7.9.4**：路由守卫 + 动画切换
- **react-hook-form + Zod**：表单与校验
- **Recharts 3.3.0**：资产趋势图表
- **TonConnect UI**：钱包接入组件

### 服务端
- **Node.js + Express 4.21**：REST API（红包、官方雨露、鲸鱼播报等）
- **node-cron**：红包价格调整 & 加速期调度
- **node-telegram-bot-api**：管理员/用户 Bot 通知
- **TON 支付监听器**：`src/server/listeners/tonPayment.ts` 轮询 Toncenter API，生成待签名 BOC

### 智能合约
- **Tact**：`contracts/contracts/` 定义
  - `t_a_i_master.tact`：TAI 主代币发行与锁仓管理（1 亿总量、9 亿锁仓）
  - `vesting_contract.tact`：18 轮释放计划，动态配置价格并释放锁仓
- **@ton/blueprint / @ton/test-utils**：部署与单元测试工具
- **合约脚本**：`contracts/scripts/` 包含地址生成、单合约部署（TAIMaster/Vesting）、批量部署与校验逻辑

### 数据库与后端集成
- **Supabase**：PostgreSQL + 行级安全
- **@supabase/supabase-js**：服务端访问（懒加载客户端 `src/server/services/supabaseClient.ts`）
- **迁移**：`supabase/migrations/` 定义用户、预测、红包、余额等结构

### 辅助工具
- **ESLint 9 / Prettier 3**：代码质量
- **Concurrently**：前后端一键启动
- **自定义脚本**：`scripts/setup-env.cjs`、`scripts/check-env.cjs`、`scripts/verifyContracts.js`

---

## 📁 项目结构

```
taizhunle/
├── contracts/                   # 智能合约工程（Tact）
│   ├── contracts/               # TAIMaster & Vesting 源码
│   ├── scripts/                 # 部署、地址生成、验证脚本
│   ├── build/ | dist/           # 编译输出
│   └── tests/                   # Tact 合约测试
├── public/                      # 静态资源（Lottie、TonConnect manifest 等）
├── src/
│   ├── app/                     # App 壳层（懒加载）
│   ├── assets/                  # 前端静态配置
│   ├── components/              # 业务组件（资产、红包、邀请、排行榜…）
│   ├── config/                  # 环境变量加载与校验
│   ├── hooks/                   # TON、Telegram、资产等自定义 Hook
│   ├── locales/                 # i18n 文案
│   ├── pages/                   # 页面入口（Assets、RedPacketSale、OfficialRain…）
│   ├── providers/               # 全局 Provider（主题、React Query）
│   ├── router.tsx               # 路由与钱包守卫
│   ├── services/                # 前端数据层（markets、tonService、userService）
│   ├── server/
│   │   ├── routes/              # REST 路由（红包、官方雨露、鲸鱼播报）
│   │   ├── listeners/           # TON 支付监听器
│   │   ├── services/            # Supabase & 红包业务逻辑
│   │   ├── jobs/                # 定时任务（价格调整、加速期）
│   │   └── utils/ & constants/  # 工具函数与配置常量
│   ├── utils/ | lib/            # 通用工具、图标
│   ├── i18n.ts / main.tsx       # 国际化初始化与应用入口
│   └── styles/                  # 全局样式（App.css / index.css）
├── supabase/                    # 数据库迁移与种子数据
├── scripts/                     # 环境检测、合约验证脚本
├── addresses.json               # 最新部署地址快照
├── package.json / package-lock.json
└── PROJECT_GUIDE.md             # 本文档
```

---

## 🎯 核心功能模块

### 1. 红包系统（前后端一体）
- **API**：`src/server/routes/redpacket.ts` 暴露 `/status`、`/session`、`/signature`、`/complete` 等端点，统一返回开发/生产模式数据。
- **业务服务**：`src/server/services/redpacketService.ts` 调用 Supabase 管理销售档、购买记录、用户余额；`mockRedpacketService.ts` 为开发模式提供离线数据。
- **TON 支付流程**：
  1. 前端向 `/api/redpacket/session` 请求购券信息，返回支付地址、memo、到期时间。
  2. 用户向平台地址转 TON，并在 memo 中携带订单编码。
  3. `TonPaymentListener` 轮询 Toncenter API，匹配 memo → 计算 TAI 奖励 → 生成待签名 BOC → 标记订单为 `awaitingSignature`。
  4. 当签名完成 `/complete` 时，Supabase 记录支付流水并累积用户 TAI。

### 2. 预测市场与资产中心
- 实时奖池、鲸鱼播报、下注签名（`useTonSignature`）
- 资产中心展示余额、趋势、红包领取概览，调用 `useAssetData` & `useRedPacketSale`

### 3. 官方雨露与邀请系统
- `/assets/official` 基于 Supabase Mock 数据刷新倒计时
- 邀请页面提供奖励分布，后端路由预留

### 4. 智能合约支撑
- `TAIMaster` 管理主供应量、锁仓释放；`TransferLocked` 消息将锁仓额度挪至 Vesting
- `VestingContract` 支持 18 期价格配置与线性释放，通过 `ConfigurePrice`/`ReleaseRound` 控制
- `scripts/deployAll.ts` 组合部署，`scripts/contractSetup.cjs` 生成 deterministic 地址，`scripts/verifyContracts.js` 对部署结果做一致性校验

### 5. 环境变量体系
- `.env.example` 列出 115 个核心配置项（当前文件包含 134 条变量，其中 115 项被服务端/前端直接引用），覆盖 TON、Supabase、Telegram、红包参数、Feature Flag、缓存、日志等。
- `src/config/env.ts`/`loadEnv.ts` 提供分层读取、115 项功能开关、打印摘要与必填项校验。

---

## 🌐 国际化（i18n）

- 语言：简体中文（zh）、英文（en）
- 自动检测顺序：URL → localStorage → 浏览器首选语言
- 命名空间（18 个）：`translation`, `detail`, `create`, `redpacket`, `assets`, `profile`, `invite`, `history`, `ranking`, `login`, `app`, `actions`, `market`, `theme`, `nav`, `form`, `common`, `brand`

---

## 🧠 服务端架构

- **TON 支付监听**：`src/server/listeners/tonPayment.ts` 以 15 秒轮询 Toncenter，跳过历史交易缓存、处理金额校验，生成未签名 BOC 并更新 Supabase。
- **红包服务层**：`src/server/services/redpacketService.ts` 负责销售档案、订单会话、签名状态、加速期统计、用户余额追踪；在 `config.features.mockData` 为 `true` 时切换到 `mockRedpacketService.ts`。
- **定时任务**：
  - `startPriceAdjustJob`（每日 00:00）根据昨日销量自动调整 TON 售价，刷新当日场次。
  - `startAccelerateJob`（每日 20:00/00:00）控制加速期倍率，后续将结合 Telegram 通知。
  - `startOfficialCreateJob`（见 `jobs/officialCreate.ts`）预留官方雨露生成。
- **Mock 开发模式**：当 `.env` 启用 `ENABLE_MOCK_DATA=true`，服务器自动回落到 Mock 服务，便于本地调试无需 Supabase/TON。

---

## 🗄️ 数据库集成

- **迁移文件**：`supabase/migrations/` 提供基础 Schema（用户、预测、下注、官方雨露）与红包核心表（`redpacket_sales`、`redpacket_purchases`、`user_balances`）。
- **关键结构**：
  - `redpacket_sales`：记录日场价格、基础/最大 TAI、加速倍率、售罄情况。
  - `redpacket_purchases`：存储每笔订单 memo、TON 金额、奖励区间、签名状态、过期时间。
  - `user_balances`：维护钱包累计/可用 TAI 以及 TON 支出。
- **Triggers & Materialized View**：迁移中包含 `update_updated_at()` 触发器与 `redpacket_sale_snapshot` 视图，供 API 快速读取当前场次。

---

## 🚀 开发与运行

```bash
# 安装依赖（根目录）
npm install

# 一键启动（前端 + 服务端）
npm run dev

# 独立启动
npm run dev:client      # 仅前端
npm run dev:server      # 仅服务端（含 Bot、Cron、TON 监听）

# 构建
npm run build           # 前端打包 + 服务端编译
npm run build:client
npm run build:server

# 合约开发（在 contracts/ 目录）
npx tact compile                     # 编译 Tact 合约
npx tact test                        # 运行合约单元测试
node scripts/deployAll.ts            # 依据 config 部署 TAIMaster + Vesting
node ../scripts/verifyContracts.js   # 在仓库根目录校验部署结果

# 数据库
npx supabase db reset --local        # 重建本地 Supabase
npx supabase db push                 # 执行迁移到远程/本地实例

# 系统校验
npm run env:check                    # 检查 115 项环境变量配置
npm run lint                         # 代码风格检查
```

> 推荐先执行 `npm run setup` 生成 `.env.local` 并填入必需配置，再启动服务端以加载 Supabase 与 TON 监听。

---

## 📦 部署说明

1. **智能合约**
   - `cd contracts`
   - `npx tact compile` 生成 `build/` 工件
   - 使用 `node scripts/deployAll.ts` 或单独的 `deployTAIMaster.ts`、`deployVestingContract.ts` 推送到链上
   - 将部署结果写入根目录 `addresses.json`，随后运行 `node scripts/verifyContracts.js` 校验 stateInit / 地址一致性

2. **数据库迁移**
   - 使用 Supabase CLI：`npx supabase db push`
   - 生产环境推荐执行 `supabase db dump` 备份后再迁移

3. **Telegram Bot**
   - 在 `.env` 中配置 `TELEGRAM_ADMIN_BOT_TOKEN`、`TELEGRAM_ADMIN_IDS`、`TELEGRAM_CHANNEL_ID`
   - `src/server/bot/index.ts` 会在服务端启动时自动拉起 bot 并监听通知指令

4. **环境变量指南**
   - `.env.example` 归类 10 余个模块（Server/Ton/Telegram/Supabase/Redpacket/OfficialRain/Whale/Logging 等）
   - `npm run env:check` 输出缺失键，并在开发模式打印配置摘要
   - 生产部署需确保 TON API Key、钱包私钥、Supabase Service Key 等敏感信息使用安全秘钥管控

5. **应用部署**
   - 前端：`npm run build:client` → 部署 `dist/` 至 Vercel/Netlify/Cloudflare Pages
   - 服务端：`npm run build:server` 后运行 `node dist/server/main.js`（可托管于 Railway/Fly/自建 VPS）

---

## 🔧 配置与服务清单

- `src/config/env.ts` / `loadEnv.ts`：环境变量读取、功能开关、敏感值检查
- `src/services/tonService.ts`：TON API 请求、交易监听辅助、支付链接生成工具
- `src/services/userService.ts`：用户资产数据占位层，待与 Supabase 接口对接
- `src/server/routes/`：REST API 路由
- `src/server/services/`：Supabase 客户端、红包服务、Mock 服务
- `src/server/listeners/tonPayment.ts`：TON 支付轮询器
- `src/server/jobs/*.ts`：价格调整、加速期、官方雨露创建调度

---

## 🐛 待办与风险

### 近期计划
- [ ] 将红包前端与 Supabase 后端联通（替换 Mock 数据）
- [ ] 追加 TON BOC 签名服务，并与链上实发交易打通
- [ ] 接入用户余额与下注记录真实 API
- [ ] 统一 Telegram Bot 通知内容（加速期提醒、支付异常）
- [ ] 为服务端添加集成测试与错误告警

### 风险评估
- **链上风险**：TON API 轮询依赖 Toncenter，可考虑自建节点/多端口容灾
- **安全风险**：钱包私钥、Supabase Service Key 必须使用安全存储；支付监听需校验金额与 memo 防止伪造
- **性能风险**：红包销量高峰需关注 Supabase TPS、定时任务写入频率与 TON 查询限额

---

## 📞 支持

- **维护者**：待补充
- **联系渠道**：待补充
- 参考资料：
  - TON：https://ton.org
  - TonConnect：https://docs.ton.org/develop/dapps/ton-connect
  - Tact：https://docs.tact-lang.org
  - Supabase：https://supabase.com/docs
  - React：https://react.dev
  - Vite：https://vitejs.dev

---

## 📄 许可证

待补充

---

**最后更新**：2025-01-31  
**版本**：v1.0.0  
**更新内容**：
- ✅ 上线红包系统后端 API + TON 支付监听，并完成 Supabase 数据建模
- ✅ 集成 Tact 智能合约（TAIMaster & Vesting），提供部署与验证脚本
- ✅ 完成环境变量、部署、开发流程与数据库/服务端架构文档化
