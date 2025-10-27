# Changelog

## [3.0.0] - 2025-10-27

### 🎉 新增功能 / New Features

#### 前端 UI
- ✨ 新增红包销售页面 (`/red-packet/sale`)
  - 玻璃质感卡片设计
  - 实时倒计时显示
  - 价格按钮带发光效果和触觉反馈
  - 售罄遮罩层
  - 价格调整横幅（±30%/+50%）
  - 加速期徽章（20:00-24:00，5% → 10%）
  - 销售进度条带动画
  
- ✨ 新增官方雨露页面 (`/red-packet/official`)
  - 单份金额展示（1000 万 TAI）
  - 下轮时间倒计时
  - 参与资格徽章
  - 门票价格按钮（0.3 TON）
  - 响应式布局

- ✨ 红包中心页面增强
  - 新增快捷入口卡片
  - 导航到销售和官方雨露页面

#### 组件库
- 🎨 `CountdownBar` - 玻璃质感倒计时条
- 🎨 `PriceButton` - 价格按钮（带发光环和触觉反馈）
- 🎨 `SoldOutOverlay` - 售罄遮罩层
- 🎨 `QualifyBadge` - 资格徽章
- 🎨 `AccelerateBadge` - 加速期徽章
- 🎨 `PriceAdjustmentBanner` - 价格调整横幅
- 🎨 `ProgressStats` - 进度统计（带 useCountUp 动画）

#### Hooks
- 🪝 `useCountDown` - 倒计时 hook
- 🪝 `useRedPacketSale` - 红包销售状态
- 🪝 `useOfficialRain` - 官方雨露状态

#### 工具函数
- 🛠️ `formatTON` - TON 金额格式化（三位分割 + 2 位小数）
- 🛠️ `formatTAI` - TAI 金额格式化（三位分割）
- 🛠️ `formatPercentage` - 百分比格式化

#### 国际化
- 🌐 新增 `sale.*` 翻译键（中英双语）
- 🌐 新增 `official.*` 翻译键（中英双语）

### 🔧 后端 API

#### 路由
- 📡 `GET /api/redpacket/status` - 获取销售状态
- 📡 `POST /api/redpacket/create` - 创建红包购买
- 📡 `POST /api/redpacket/claim` - 领取红包
- 📡 `POST /api/redpacket/claim/submit` - 提交签名
- 📡 `GET /api/official/next` - 获取下轮官方雨露
- 📡 `POST /api/official/claim` - 领取官方雨露
- 📡 `GET /api/whale` - 获取鲸鱼榜

#### 定时任务
- ⏰ 价格调整任务（每日 00:00）
  - 根据昨日销量自动调价
  - 支持 -30% / 0% / +30% / +50% 四档
  - 自动发送 Telegram 通知

- ⏰ 加速期任务（每日 20:00-24:00）
  - 裂变系数 5% → 10%
  - 自动发送 Telegram 通知

- ⏰ 官方雨露生成任务（每日 4 次）
  - 12:00, 14:00, 18:00, 22:00
  - 随机金额 5k-100k TAI
  - 自动发送 Telegram 通知

#### Telegram Bot
- 🤖 `/price` - 查看当前价格（管理员）
- 🤖 `/accelerate` - 查看加速状态（管理员）
- 🤖 `/soldout` - 查看销售状态
- 🤖 `/next` - 查看下轮官方雨露时间
- 🤖 频道通知功能

#### 数据库
- 🗄️ `redpacket_sales` - 红包销售表
- 🗄️ `official_rain` - 官方雨露表
- 🗄️ `redpacket_purchases` - 购买记录表
- 🗄️ `official_rain_claims` - 领取记录表
- 🗄️ `whale_rankings` - 鲸鱼榜表
- 🔒 Row Level Security 策略
- 📊 自动更新时间戳触发器

### 🚀 部署

#### 配置文件
- 📦 `Dockerfile` - Docker 镜像构建
- 📦 `docker-compose.yml` - Docker Compose 配置
- 📦 `vercel.json` - Vercel 部署配置
- 📦 `railway.toml` - Railway 部署配置
- 📦 `.env.example` - 环境变量示例
- 📦 `tsconfig.server.json` - 服务器 TypeScript 配置

#### CI/CD
- 🔄 GitHub Actions 工作流
  - 自动 lint 和 build
  - 自动部署到 Vercel

#### 文档
- 📚 `DEPLOYMENT.md` - 完整部署指南
- 📚 `CHANGELOG.md` - 更新日志

### 🎨 设计系统

#### 全局样式
- 所有金额：`font-mono` + 三位分割 + 2 位小数
- 所有按钮：`hover:ring-2` + `active:scale-95` + 触觉反馈
- 所有卡片：玻璃质感 `backdrop-blur-md` + `bg-surface-glass/60`
- 所有空态：统一使用 `<EmptyState />` 组件

#### 响应式
- 移动端：底部 sticky CTA
- 桌面端：侧边栏布局
- 所有页面：完全响应式

### 📦 依赖更新

#### 新增依赖
- `@supabase/supabase-js` - Supabase 客户端
- `express` - Web 框架
- `cors` - CORS 中间件
- `helmet` - 安全中间件
- `node-cron` - 定时任务
- `node-telegram-bot-api` - Telegram Bot

#### 开发依赖
- `@types/express` - Express 类型定义
- `@types/cors` - CORS 类型定义
- `@types/node-cron` - node-cron 类型定义
- `@types/node-telegram-bot-api` - Telegram Bot 类型定义
- `concurrently` - 并发运行脚本
- `tsx` - TypeScript 执行器

### 🔧 脚本更新

```json
{
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite --host 0.0.0.0 --port 5173",
  "dev:server": "tsx watch src/server/main.ts",
  "build": "tsc -b && vite build && tsc -p tsconfig.server.json",
  "build:client": "tsc -b && vite build",
  "build:server": "tsc -p tsconfig.server.json",
  "start": "node dist/server/main.js",
  "deploy": "npm run build && vercel --prod",
  "db:reset": "npx supabase db reset --local",
  "db:push": "npx supabase db push"
}
```

### ✅ 质量保证

- ✅ `npm run lint` - 0 error
- ✅ `npm run build` - 0 error
- ✅ 所有可见文字 0 硬编码中文
- ✅ 所有金额格式化统一
- ✅ 所有按钮交互一致
- ✅ 所有页面响应式
- ✅ 所有组件可复用

### 🏷️ Git Tag

```bash
git tag -a biz-final-v3.0 -m "业务逻辑冻结，合约上线前"
```

### 📊 统计

- 新增文件：30+
- 新增代码行数：2000+
- 新增组件：13
- 新增 Hooks：3
- 新增 API 路由：7
- 新增定时任务：3
- 新增数据库表：5

### 🎯 下一步

- [ ] 连接真实 TON 合约
- [ ] 实现支付监听器
- [ ] 完善 Telegram Bot 功能
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 性能优化
- [ ] SEO 优化
