# 安全审查报告

## 审查日期
2025-11-03

## 审查范围
- API 端点认证/授权
- 敏感数据保护
- 环境变量安全
- 输入验证

## 发现的问题

### 1. 缺少 API 认证机制（高风险）

**问题描述：**
大部分 API 端点没有任何认证机制，任何人都可以访问。

**受影响的端点：**
- `/api/markets/*` - 市场数据（读取）
- `/api/dao/*` - DAO 统计和领取
- `/api/invite/*` - 邀请统计和领取
- `/api/ranking/*` - 排行榜数据
- `/api/redpacket/*` - 红包创建和购买
- `/api/official/*` - 官方雨露领取

**风险等级：** 高

**建议修复：**
1. 为写操作（POST/PUT/DELETE）添加钱包签名验证
2. 为敏感读操作添加 rate limiting
3. 实现基于 JWT 的会话管理

### 2. 环境变量暴露（中风险）

**问题描述：**
`.env` 文件包含占位符凭据，但在开发模式下可能被误用。

**受影响的变量：**
- `SUPABASE_SERVICE_KEY` - 数据库完全访问权限
- `TELEGRAM_ADMIN_BOT_TOKEN` - Telegram Bot 控制权
- `JWT_SECRET` - 会话加密密钥

**风险等级：** 中

**建议修复：**
1. 确保 `.env` 在 `.gitignore` 中
2. 使用环境变量管理服务（如 Vercel Secrets）
3. 定期轮换敏感凭据

### 3. 缺少输入验证（中风险）

**问题描述：**
部分端点缺少严格的输入验证，可能导致注入攻击。

**受影响的端点：**
- `/api/markets/:id/bets` - 下注金额验证不足
- `/api/dao/claim` - 用户 ID 验证不足
- `/api/invite/claim` - 领取金额验证不足

**风险等级：** 中

**建议修复：**
1. 使用 Zod 进行输入验证
2. 添加金额范围检查
3. 验证用户身份与操作权限

### 4. 缺少 Rate Limiting（中风险）

**问题描述：**
所有端点都没有速率限制，容易被滥用。

**风险等级：** 中

**建议修复：**
1. 使用 `express-rate-limit` 中间件
2. 为不同端点设置不同的限制
3. 基于 IP 和钱包地址双重限制

## 已实施的安全措施

### 1. Mock 数据模式
- ✅ 开发环境使用 Mock 数据，避免真实数据泄露
- ✅ `ENABLE_MOCK_DATA=true` 隔离真实数据库

### 2. CORS 配置
- ✅ 限制了允许的来源域名
- ✅ 生产环境需要配置 `CORS_ORIGIN`

### 3. Helmet 安全头
- ✅ 使用 Helmet 中间件设置安全 HTTP 头
- ✅ CSP 在开发环境禁用，生产环境启用

## 修复优先级

### P0 - 立即修复（上线前必须）
1. [ ] 为所有写操作添加钱包签名验证
2. [ ] 移除或加密 `.env` 中的真实凭据
3. [ ] 添加基本的 rate limiting

### P1 - 高优先级（上线后一周内）
1. [ ] 实现完整的认证/授权系统
2. [ ] 添加审计日志
3. [ ] 实施输入验证框架

### P2 - 中优先级（上线后一个月内）
1. [ ] 添加 API 监控和告警
2. [ ] 实施自动化安全扫描
3. [ ] 完善错误处理，避免信息泄露

## 建议的安全架构

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Request + Wallet Signature
       ▼
┌─────────────────────────────────┐
│  Rate Limiter Middleware        │
│  (express-rate-limit)           │
└──────┬──────────────────────────┘
       │ 2. Check rate limit
       ▼
┌─────────────────────────────────┐
│  Auth Middleware                │
│  - Verify wallet signature      │
│  - Check JWT token              │
└──────┬──────────────────────────┘
       │ 3. Verify identity
       ▼
┌─────────────────────────────────┐
│  Input Validation Middleware    │
│  (Zod schemas)                  │
└──────┬──────────────────────────┘
       │ 4. Validate input
       ▼
┌─────────────────────────────────┐
│  Business Logic                 │
│  (Route handlers)               │
└──────┬──────────────────────────┘
       │ 5. Process request
       ▼
┌─────────────────────────────────┐
│  Audit Log                      │
│  (Record sensitive operations)  │
└─────────────────────────────────┘
```

## 下一步行动

1. **创建认证中间件** - `src/server/middleware/auth.ts`
2. **创建验证中间件** - `src/server/middleware/validation.ts`
3. **创建 rate limiting 配置** - `src/server/middleware/rateLimiter.ts`
4. **更新所有敏感端点** - 添加中间件保护
5. **编写安全测试** - 验证保护措施有效性

## 参考资源

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TON Connect Authentication](https://docs.ton.org/develop/dapps/ton-connect/overview)
