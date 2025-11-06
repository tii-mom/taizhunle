# 🎯 Taizhunle (太准了) - TON 预测市场 DApp

基于 TON 区块链的去中心化预测市场，支持红包系统、官方雨露、用户创建预测等功能。

## ✨ 主要功能

- 🎲 **预测市场** - 创建和参与预测，实时查看赔率、评论、我的注单
- 🛡️ **质押式创建** - 创建预测需按积分质押 1,000 ~ 20,000 TAI，结算后自动返还或按规则扣减
- ⚖️ **陪审奖励** - 下注手续费 1% 流入陪审奖励池，DAO 页面可一键领取
- 🧧 **红包系统** - 单档 9.99 TON，支持裂变与加速期调价
- 🌧️ **官方雨露** - 6 亿池子定时生成，提供倒计时与提醒
- 👥 **邀请系统** - 邀请好友获得返利与榜单展示
- 🏆 **排行榜** - 鲸鱼榜、邀请榜、陪审榜等多维榜单
- 💠 **白名单认购** - 质押用户可在每轮解锁后按上一轮价格抢购 TAI（USDC/USDT 支付，储备池兜底）
- 🌍 **国际化** - 中英双语言与 UI

## 🚀 快速开始

### 1. 环境配置

```bash
# 克隆项目
git clone <repository-url>
cd taizhunle

# 安装依赖
npm install

# 配置环境变量 (交互式)
npm run setup
```

### 2. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:client  # 前端 http://localhost:5173
npm run dev:server  # 后端 http://localhost:3000
```

### 3. 验证配置

```bash
# 检查环境变量
npm run env:validate

# 查看健康状态
curl http://localhost:3000/health
```

## 🛠️ 技术栈

### 前端
- **React 19** + **TypeScript 5.9** - 现代化前端框架
- **Vite 7** - 快速构建工具
- **TailwindCSS 3.4** - 原子化 CSS 框架
- **Framer Motion 12** - 动画库
- **React Router 7** - 路由管理
- **TanStack Query 5** - 数据状态管理
- **i18next 25** - 国际化

### 后端
- **Node.js 20** + **Express 4** - 服务器框架
- **TypeScript** - 类型安全
- **Supabase** - 数据库和认证
- **node-cron** - 定时任务
- **node-telegram-bot-api** - Telegram 集成

### 区块链
- **TON Connect 2** - 钱包连接
- **TON API** - 区块链交互
- **Tact 合约套件** - `tai_unlock_controller`、`prediction_market`、`juror_staking`、`tai_oracle`

## 📁 项目结构

```
taizhunle/
├── src/
│   ├── app/                    # 应用主页面
│   ├── pages/                  # 路由页面
│   ├── components/             # 组件库
│   │   ├── common/            # 通用组件
│   │   ├── market/            # 市场相关
│   │   ├── redpacket/         # 红包相关
│   │   └── ...
│   ├── hooks/                  # 自定义 Hooks
│   ├── services/              # API 服务
│   ├── config/                # 配置文件
│   ├── locales/               # 国际化文件
│   └── server/                # 后端代码
│       ├── routes/            # API 路由
│       ├── jobs/              # 定时任务
│       └── bot/               # Telegram Bot
├── public/                     # 静态资源
├── docs/                       # 项目文档
└── scripts/                    # 工具脚本
    ├── generate-whitelist-merkle.ts     # 质押快照 → 配额 + Merkle 根
    ├── encode-start-whitelist-sale.ts   # 生成 StartWhitelistSale 参数
    └── deploy-whitelist-sale.ts         # 占位脚本，演示 StartWhitelistSale 交易调用
```

## 🔧 配置说明

### 必需配置
- **Supabase**: 数据库和后端服务
- **Telegram Bot**: 管理和通知功能
- **TON API**: 区块链交互
- **JWT Secret**: 安全认证

### 业务配置
- **红包价格**: 默认 9.99 TON
- **裂变系数**: 正常 5%，加速期 10%
- **官方雨露**: 每份 1,000 万 TAI
- **下注手续费**: 默认 3%（陪审 1% + 创建 0.5% + 邀请 0.5% + 平台 1%），可通过 `FEE_*` 环境变量调整
- **白名单认购**: 每轮解锁后 60%（30 亿）面向质押用户开放，价格沿用上一轮，支付 USDC/USDT 写入储备池

### 创建质押与陪审奖励

| 积分范围 | 称号 | 需质押 (TAI) | 创建冷却 |
|----------|------|---------------|-----------|
| 普通用户 | - | 1,000 | 360 小时 |
| 0-99     | 武林新丁 | 1,000 | 72 小时 |
| 100-399  | 风尘奇侠 | 5,000 | 48 小时 |
| 400-999  | 地狱判官 | 10,000 | 24 小时 |
| 1000+    | 天上天下天地无双 | 20,000 | 6 小时 |

- 创建预测时锁定 `creatorStakeTai`，预测结算或审核通过后返还；申诉成立扣 50%，恶意或超时按 20%~100% 扣减。
- 陪审奖励恒为实时奖池的 **1%**，通过 DAO 面板实时展示并可一键领取。

详细配置说明请查看 [环境配置指南](docs/ENVIRONMENT.md)

## 📚 开发指南

### 环境变量管理
```bash
npm run setup          # 交互式配置
npm run env:validate   # 验证配置
npm run env:check      # 检查配置
```

### 数据库管理
```bash
npm run db:reset       # 重置本地数据库
npm run db:push        # 推送 Schema 到远程
```

### 代码质量
```bash
npm run lint           # 代码检查
npm run build          # 构建项目
npm run preview        # 预览构建结果
npm run test:e2e       # 预测质押 & 陪审奖励端到端校验
```

## 🚀 部署

### 一键部署
```bash
npm run deploy         # 部署到 Vercel
```

### Docker 部署
```bash
docker-compose up -d   # 使用 Docker Compose
```

### 手动部署
```bash
npm run build          # 构建项目
npm start              # 启动生产服务器
```

支持的部署平台：
- **Vercel** (推荐前端)
- **Railway** (推荐全栈)
- **Docker** (自托管)
- **Netlify** (静态部署)

## 🔐 安全注意事项

1. **环境变量安全**
   - 永远不要提交 `.env` 文件
   - 使用强密码和随机密钥
   - 定期轮换 API 密钥

2. **钱包安全**
   - 测试环境使用测试网
   - 生产环境使用硬件钱包
   - 限制钱包权限和余额

3. **API 安全**
   - 启用速率限制
   - 验证所有输入
   - 使用 HTTPS

## 📊 功能开关

通过环境变量控制功能启用/禁用：

```env
VITE_ENABLE_REDPACKET=true        # 红包功能
VITE_ENABLE_OFFICIAL_RAIN=true    # 官方雨露
VITE_ENABLE_USER_PREDICTION=true  # 用户创建预测
VITE_ENABLE_APPEAL_SYSTEM=true    # 申诉系统
```

## 🤖 Telegram Bot

### 管理员命令
- `/price` - 查看当前红包价格
- `/accelerate` - 查看加速期状态
- `/approve <id>` - 通过预测审核
- `/reject <id>` - 拒绝预测审核
- `/settle <id> <result>` - 结算预测结果

### 用户命令
- `/soldout` - 查看销售状态
- `/next` - 查看下轮官方雨露时间

## 📈 监控和分析

### 健康检查
```bash
curl http://localhost:3000/health
```

### 配置查看 (开发环境)
```bash
curl http://localhost:3000/api/config
```

### 日志查看
```bash
tail -f logs/app.log
```

## 🆘 故障排查

### 常见问题
1. **环境变量未加载** - 运行 `npm run env:validate`
2. **数据库连接失败** - 检查 Supabase 配置
3. **Telegram Bot 无响应** - 验证 Bot Token
4. **TON API 调用失败** - 检查 API Key 和网络

### 获取帮助
- 📖 [项目文档](docs/)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
- 💬 [Telegram 群组](https://t.me/your-group)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

**最后更新**: 2025-10-31  
**版本**: v1.0.0  
**开发团队**: Taizhunle Team
