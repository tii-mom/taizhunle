# Taizhunle（太准了）项目说明

## 📋 项目概述

**Taizhunle（太准了）** 是一个基于 TON 区块链的去中心化预测市场 DApp，用户可以创建和参与各种预测市场，使用 TAI 代币进行下注。

- **项目类型**：Web3 DApp
- **区块链**：TON（The Open Network）
- **代码规模**：约 2,064 行 TypeScript/TSX（44 个源文件）
- **部署方式**：静态网站部署

---

## 🛠 技术栈

### 核心框架
- **React 19.1.1** - 前端框架
- **TypeScript 5.9.3** - 类型安全
- **Vite 7.1.7** - 构建工具

### UI 与样式
- **TailwindCSS 3.4.15** - 原子化 CSS
- **自定义主题系统** - 明暗主题切换

### 区块链集成
- **@tonconnect/ui-react 2.3.1** - TON 钱包连接
- **TON SDK** - 链上交互

### 状态管理与数据
- **@tanstack/react-query 5.90.5** - 服务端状态管理
- **React Hook Form 7.65.0** - 表单管理
- **Zod 4.1.12** - 数据验证

### 国际化
- **i18next 25.6.0** - 国际化框架
- **react-i18next 16.2.0** - React 集成
- **i18next-browser-languagedetector 8.2.0** - 语言自动检测

### 路由
- **React Router 7.9.4** - 单页应用路由

---

## 📁 项目结构

```
taizhunle/
├── public/                      # 静态资源
│   ├── avatars/                # 头像资源（108 个 PNG 文件）
│   ├── tonconnect-manifest.json # TON 钱包配置
│   └── vite.svg
├── src/
│   ├── app/                    # 应用主组件
│   │   └── App.tsx            # 市场首页
│   ├── pages/                  # 页面组件（8 个页面）
│   │   ├── Login.tsx          # 登录页（NEW）
│   │   ├── AvatarMarket.tsx   # 头像市场
│   │   ├── Create.tsx         # 创建市场
│   │   ├── Detail.tsx         # 市场详情
│   │   ├── Invite.tsx         # 邀请页面
│   │   ├── Profile.tsx        # 个人中心
│   │   ├── Ranking.tsx        # 排行榜
│   │   └── RedPacket.tsx      # 红包页面
│   ├── components/             # 业务组件
│   │   ├── avatar/            # 头像相关（4 个组件）
│   │   │   ├── AvatarBlindBox.tsx
│   │   │   ├── AvatarFilters.tsx
│   │   │   ├── AvatarGrid.tsx
│   │   │   └── AvatarInventory.tsx
│   │   ├── create/            # 市场创建（2 个组件）
│   │   │   ├── Form.tsx
│   │   │   └── Schedule.tsx
│   │   ├── detail/            # 市场详情（3 个）
│   │   │   ├── History.tsx
│   │   │   ├── Summary.tsx
│   │   │   └── useDetailData.ts
│   │   ├── invite/            # 邀请功能（3 个）
│   │   │   ├── InviteHistory.tsx
│   │   │   ├── InviteRewards.tsx
│   │   │   └── InviteSummary.tsx
│   │   ├── profile/           # 个人中心（4 个）
│   │   │   ├── ProfileBlindBox.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileMilestones.tsx
│   │   │   └── ProfileTitles.tsx
│   │   ├── ranking/           # 排行榜（3 个）
│   │   │   ├── RankingLive.tsx
│   │   │   ├── RankingShare.tsx
│   │   │   └── RankingTitles.tsx
│   │   ├── redpacket/         # 红包（4 个）
│   │   │   ├── Actions.tsx
│   │   │   ├── List.tsx
│   │   │   ├── Marquee.tsx
│   │   │   └── Tabs.tsx
│   │   ├── BetModal.tsx       # 下注弹窗
│   │   └── market/            # 市场组件（空目录）
│   ├── hooks/                  # 自定义 Hooks（3 个）
│   │   ├── useTonWallet.ts    # TON 钱包交互
│   │   ├── useTonSign.ts      # TON 签名（NEW）
│   │   └── useTelegramUser.ts # Telegram 用户信息
│   ├── providers/              # 全局 Provider
│   │   ├── AppProviders.tsx   # 应用级 Provider 聚合
│   │   └── ThemeProvider.tsx  # 主题管理
│   ├── services/               # API 服务层（NEW）
│   │   └── markets.ts         # 市场数据服务
│   ├── locales/                # 国际化文件
│   │   ├── zh/                # 中文翻译（14 个命名空间）
│   │   │   ├── app.json
│   │   │   ├── actions.json
│   │   │   ├── market.json
│   │   │   ├── detail.json
│   │   │   ├── create.json
│   │   │   ├── redpacket.json
│   │   │   ├── profile.json
│   │   │   ├── invite.json
│   │   │   ├── history.json
│   │   │   ├── avatar.json
│   │   │   ├── ranking.json
│   │   │   ├── login.json     # 登录页翻译（NEW）
│   │   │   ├── translation.json
│   │   │   └── common.json
│   │   └── en/                # 英文翻译（同上结构）
│   ├── assets/                 # 静态资源
│   │   ├── avatar-config.json # 头像配置
│   │   └── react.svg
│   ├── config/                 # 配置文件
│   │   └── token.ts           # 代币配置
│   ├── lib/                    # 工具函数库
│   ├── styles/                 # 样式目录
│   ├── router.tsx              # 路由配置（含路由守卫）
│   ├── i18n.ts                 # 国际化配置
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # App 导出
│   ├── App.css                 # App 样式
│   └── index.css               # 全局样式
├── dist/                        # 构建输出目录
├── node_modules/                # 依赖包
├── .git/                        # Git 仓库
├── package.json                 # 项目配置
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.js          # Tailwind 配置
├── eslint.config.js            # ESLint 配置
├── postcss.config.js           # PostCSS 配置
└── README.md                    # 项目说明
```

---

## 🎯 核心功能模块

### 0. 登录页（/login）⭐ NEW
- ✅ TON 钱包连接界面
- ✅ 签名测试功能
- ✅ 连接成功自动跳转
- ✅ 精美的 UI 设计

### 1. 市场首页（/）
- ✅ 实时奖池展示（TAI 代币，每 3 秒刷新）
- ✅ 市场卡片列表（支持 4 种筛选：全部/进行中/已结束/我的注单）
- ✅ 鲸鱼动向实时提醒（轮播展示大额交易）
- ✅ TonConnect 钱包连接
- ✅ 主题切换（明暗模式）
- ✅ 语言切换（中英文）

### 2. 市场详情（/detail/:id）
- 查看单个预测市场的详细信息
- 历史交易记录
- 参与下注

### 3. 创建市场（/create）
- 用户自定义创建预测市场
- 表单验证（React Hook Form + Zod）
- 市场时间表设置

### 4. 红包功能（/red-packet）
- 发放和领取红包
- 红包历史记录

### 5. 个人中心（/profile）
- 用户等级系统（经验值、升级进度）
- 连续签到天数
- 称号系统（已获得称号展示）
- 里程碑成就追踪
- 盲盒开启功能

### 6. 邀请系统（/invite）
- 邀请链接生成
- 邀请奖励统计
- 邀请历史记录

### 7. 头像市场（/avatars）
- 头像 NFT 浏览和交易
- 头像筛选功能（AvatarFilters）
- 网格展示（AvatarGrid）
- 盲盒开启（AvatarBlindBox）
- 库存管理（AvatarInventory）
- 108 个头像 PNG 资源

### 8. 排行榜（/ranking）
- 用户排名展示
- 实时数据更新
- 分享功能

---

## 🌐 国际化（i18n）

### 支持语言
- 🇨🇳 简体中文（zh）
- 🇺🇸 英文（en）

### 命名空间
项目采用模块化 i18n 配置，包含 **14 个命名空间**：

| 命名空间 | 说明 |
|---------|------|
| `translation` | 通用翻译 |
| `app` | 应用级别（主题等） |
| `actions` | 操作按钮 |
| `market` | 市场相关 |
| `detail` | 市场详情 |
| `create` | 创建市场 |
| `redpacket` | 红包功能 |
| `profile` | 个人中心 |
| `invite` | 邀请系统 |
| `history` | 历史记录 |
| `avatar` | 头像市场 |
| `ranking` | 排行榜 |
| `login` | 登录页面 ⭐ NEW |
| `common` | 通用文案 |

### 语言切换逻辑
1. 自动检测浏览器语言
2. 支持 URL 参数指定（`?lng=zh`）
3. 手动切换后存储到 localStorage
4. 默认回退语言：英文

---

## 🔗 TON 区块链集成

### 钱包连接
使用 **TonConnect** 协议实现钱包连接：

```typescript
// 配置文件位置
public/tonconnect-manifest.json

// 关键 Hook 1: useTonWallet（钱包状态）
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export function useTonSignature() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  
  const requestSignature = async (text: string) => {
    return tonConnectUI.signData({ type: 'text', text });
  };
  
  return { wallet, isReady: Boolean(wallet), requestSignature };
}

// 关键 Hook 2: useTonSign（签名功能）⭐ NEW
export function useTonSign() {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  
  const sign = async (message: string) => {
    setLoading(true);
    try {
      const result = await tonConnectUI.signData({
        type: 'text',
        text: message,
      });
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  return { sign, loading };
}
```

### 路由守卫 ⭐ NEW
项目实现了完整的**钱包连接路由守卫**：

```typescript
// src/router.tsx
const withWalletGuard = (element: ReactElement) => {
  const WalletGuard = () => {
    const wallet = useTonWallet();
    if (!wallet) {
      return <Navigate to="/login" replace />;
    }
    return element;
  };
  return <WalletGuard />;
};

// 所有页面都受保护，未连接钱包自动跳转到登录页
export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: withWalletGuard(<App />) },
  { path: '/detail/:id', element: withWalletGuard(<Detail />) },
  // ... 其他受保护路由
]);
```

### 功能清单
- ✅ 钱包连接/断开
- ✅ 账户地址展示
- ✅ 交易签名请求
- ✅ 登录页面（/login）
- ✅ 路由守卫（未连接自动跳转）
- ✅ 签名测试功能
- ⏳ 链上交易提交（待对接后端）
- ⏳ 代币余额查询（待对接后端）

---

## 🎨 主题系统

### 明暗主题
- **亮色主题**：默认白色背景
- **暗色主题**：深色背景
- **自动检测**：跟随系统设置
- **持久化**：localStorage 存储用户选择

### 主题变量（TailwindCSS）
```css
/* 示例：文本颜色变量 */
.text-text-primary    /* 主要文本 */
.text-text-secondary  /* 次要文本 */
.bg-background        /* 背景色 */
.bg-surface           /* 卡片背景 */
.text-accent          /* 强调色 */
```

---

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
# 访问 http://localhost:5173
# 支持局域网访问：http://0.0.0.0:5173
```

### 构建生产版本
```bash
npm run build
# 输出目录：dist/
```

### 预览生产构建
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

---

## 📦 部署说明

### 构建产物
```bash
npm run build
```
生成的 `dist/` 目录包含：
- `index.html` - 入口 HTML
- `assets/` - 打包后的 JS/CSS
- `avatars/` - 头像资源
- `tonconnect-manifest.json` - TON 配置

### 部署平台推荐
- **Vercel**（推荐）
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**
- **IPFS**（去中心化部署）

### 环境变量（如需要）
创建 `.env` 文件：
```env
VITE_API_URL=https://api.example.com
VITE_TON_NETWORK=mainnet
```

---

## 🔧 配置文件说明

### vite.config.ts
Vite 构建配置，使用 React 插件。

### tailwind.config.js
TailwindCSS 主题配置，包含自定义颜色、字体等。

### tsconfig.json
TypeScript 编译配置，包含：
- `tsconfig.app.json` - 应用代码配置
- `tsconfig.node.json` - Node 脚本配置

### eslint.config.js
ESLint 代码规范配置，集成：
- TypeScript 支持
- React 规则
- Prettier 兼容

### public/tonconnect-manifest.json
TON 钱包连接配置：
```json
{
  "url": "https://example.com",
  "name": "Taizhunle",
  "iconUrl": "https://example.com/icon.png"
}
```
⚠️ **部署前需要更新为实际域名**

---

## 📝 开发规范

### 代码风格
- 使用 ESLint + Prettier 自动格式化
- 遵循 Airbnb React 规范
- 使用 TypeScript 严格模式

### 组件规范
- 功能组件优先（React Hooks）
- 组件文件使用 PascalCase 命名
- 自定义 Hook 以 `use` 开头

### Git 提交规范（建议）
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

---

## 🔒 安全注意事项

1. **私钥安全**：永远不要在代码中硬编码私钥
2. **环境变量**：敏感信息使用环境变量
3. **钱包签名**：所有交易需要用户明确确认
4. **输入验证**：使用 Zod 进行数据验证
5. **XSS 防护**：i18next 配置了 `escapeValue: false`，需注意用户输入

---

## 📊 性能优化

- ✅ Vite 构建优化（代码分割、Tree Shaking）
- ✅ React.lazy 懒加载（可扩展）
- ✅ TanStack Query 数据缓存
- ✅ 图片资源优化
- ⏳ CDN 加速（待配置）

---

## 📊 数据层架构 ⭐ NEW

### Services 层
项目新增了 `src/services/` 目录，使用 **TanStack Query** 管理服务端状态：

```typescript
// src/services/markets.ts

// 类型定义
export type MarketFilter = 'all' | 'live' | 'closed' | 'my';
export type MarketCard = {
  id: string;
  filter: 'live' | 'closed';
  isMine?: boolean;
  title: string;
  description: string;
  status: string;
  odds: string;
  volume: string;
  pool: number;
  bets: MarketBet[];
};

// 自定义 Hooks
export const useMarketsQuery = (filter: MarketFilter) => useQuery(...);
export const useMarketDetailQuery = (id: string) => useQuery(...);
export const usePlaceBetMutation = () => useMutation(...);
```

### Mock 数据
当前使用 **本地 Mock 数据**模拟 API 响应：
- 3 个预设市场（BTC、ETH、TON）
- 每个市场包含历史下注记录
- 模拟 300ms 网络延迟

### 数据流
```
Component → Custom Hook (useMarketsQuery) → TanStack Query → Mock API → State
```

---

## 🐛 已知问题与待办

### 待对接后端
- [ ] 替换 Mock 数据为真实 API
- [ ] 市场数据实时更新（WebSocket）
- [ ] 用户余额实时查询
- [ ] 下注交易链上提交
- [ ] 排行榜数据接口
- [ ] 邀请奖励结算逻辑
- [ ] 红包功能后端集成

### 功能增强
- [ ] 添加单元测试（Jest + React Testing Library）
- [ ] 添加 E2E 测试（Playwright）
- [ ] 完善错误边界处理
- [ ] 添加 PWA 支持
- [ ] 优化移动端体验

### 性能优化
- [ ] 图片懒加载
- [ ] 虚拟滚动（长列表）
- [ ] Service Worker 缓存

---

## 📞 联系与支持

### 项目维护
- **开发者**：[待填写]
- **联系方式**：[待填写]

### 相关链接
- TON 官网：https://ton.org
- TonConnect 文档：https://docs.ton.org/develop/dapps/ton-connect
- React 文档：https://react.dev
- Vite 文档：https://vitejs.dev

---

## 📄 许可证

[待添加许可证信息]

---

**最后更新**：2025-10-27  
**版本**：v0.1.0  
**更新内容**：
- ✅ 新增登录页面（/login）
- ✅ 实现钱包路由守卫
- ✅ 新增 services 数据层
- ✅ 优化项目结构文档
- ✅ 更新至 44 个源文件、2064 行代码
