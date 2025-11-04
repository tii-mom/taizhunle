/**
 * Rate Limiting 中间件
 * 防止 API 滥用和 DDoS 攻击
 */
import rateLimit from 'express-rate-limit';

// 通用 API 限制：每 15 分钟 100 个请求
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 严格限制（用于写操作）：每 15 分钟 20 个请求
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 领取操作限制：每小时 5 次
export const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many claim attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 基于钱包地址或 IP 限制
    return req.body?.wallet || req.body?.userId || req.ip;
  },
});

// 购买操作限制：每小时 10 次
export const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many purchase attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.wallet || req.ip;
  },
});
