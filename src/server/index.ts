import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, checkRequiredEnv, printConfig } from '../config/env.js';
import { redpacketRouter } from './routes/redpacket.js';
import { officialRouter } from './routes/official.js';
import { whaleRouter } from './routes/whale.js';

// 检查环境变量
if (!checkRequiredEnv()) {
  console.error('❌ 环境变量检查失败，服务器启动中止');
  process.exit(1);
}

const app = express();

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: config.server.isDevelopment ? false : undefined,
}));

app.use(cors({
  origin: config.server.isDevelopment 
    ? ['http://localhost:5173', 'http://localhost:4173']
    : process.env.CORS_ORIGIN?.split(',') || false,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志 (开发环境)
if (config.server.isDevelopment) {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    version: '1.0.0',
    environment: config.server.nodeEnv,
    features: {
      mockData: config.features.mockData,
      redpacket: process.env.VITE_ENABLE_REDPACKET === 'true',
      officialRain: process.env.VITE_ENABLE_OFFICIAL_RAIN === 'true',
    }
  });
});

// 配置信息端点 (仅开发环境)
if (config.server.isDevelopment) {
  app.get('/api/config', (_req: Request, res: Response) => {
    res.json({
      server: {
        nodeEnv: config.server.nodeEnv,
        port: config.server.port,
      },
      ton: {
        network: config.ton.network,
        apiEndpoint: config.ton.apiEndpoint,
      },
      business: {
        redpacket: {
          priceTon: config.business.redpacket.priceTon,
          baseAmount: config.business.redpacket.baseAmount,
        },
        officialRain: {
          amount: config.business.officialRain.amount,
          ticketPrice: config.business.officialRain.ticketPrice,
        },
      },
      features: config.features,
    });
  });
}

// API 路由
app.use('/api/redpacket', redpacketRouter);
app.use('/api/official', officialRouter);
app.use('/api/whale', whaleRouter);

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ 服务器错误:', err);
  
  if (config.server.isDevelopment) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
});

// 404 处理
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route not found`,
  });
});

// 启动服务器
const server = app.listen(config.server.port, () => {
  console.log(`🚀 Taizhunle 服务器启动成功`);
  console.log(`📍 地址: http://localhost:${config.server.port}`);
  printConfig();
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

export default app;
