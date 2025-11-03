# 发布验收标准

## 功能验收
- [ ] 红包购买（TonConnect 支付 + 奖励到账）全链路演练
- [ ] 官方雨露领取（TonConnect 签名）演练
- [ ] 邀请 / 排行 / 鲸鱼榜数据校准与分页检查

## 自动化结果
- [ ] GitHub Actions `CI` 工作流成功
- [ ] `npm run lint` / `npm run test` / `npm run build` 均通过
- [ ] `scripts/test-system.js` 检查无阻塞告警

## 性能与安全
- [ ] Supabase 指标监控（连接数、慢查询）开启
- [ ] TON / Telegram 凭证加密存储并有轮换计划
- [ ] DDoS / 限流策略验证（Helmet、Rate Limit）

## 回滚策略
- [ ] 保留上一版本构建产物与数据库快照
- [ ] Telegram / TON Key 具备备用配置
- [ ] 预案：出现重大故障 15 分钟内切回

## 交付文档
- [ ] 更新 `CHANGELOG.md`
- [ ] 归档 `docs/RUNBOOK_AUTOMATION.md`、`docs/DEPLOYMENT_CHECKLIST.md`
- [ ] 输出最终回归报告
