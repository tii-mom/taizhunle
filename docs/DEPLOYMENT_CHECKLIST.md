# 部署前检查清单

## 前置验证
- [ ] `npm run env:validate` 确保环境变量完善
- [ ] `scripts/test-system.js` 运行通过，确认 TON / Telegram 连通
- [ ] `npm run lint`、`npm run test`、`npm run build` 均成功

## Vercel
1. `npm run deploy` 或在 Dashboard 触发
2. 配置环境变量：`SUPABASE_*`, `TON_API_KEY`, `TELEGRAM_*`
3. 确认构建日志无错误，使用 Preview 验证 `/health`

## Railway
1. `railway up` (需 `railway login`)
2. 在项目变量中同步 `.env`
3. 部署完成后访问公开 URL，确认 `/api/redpacket/status`

## Docker / 自托管
```bash
docker compose build
docker compose up -d
```
- 访问 `http://localhost:3000/health`
- 访问 `http://localhost:5173`

## 灰度与回滚
- 建议先在预发布环境部署，成功后再切换生产
- 如需回滚，保留上一版本镜像/构建，并重新指向旧版本
- Telegram 和 TON Key 需具备备用副本，以便紧急替换
