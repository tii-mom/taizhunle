// 首先手动加载环境变量
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 手动加载 .env 文件
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    console.warn('⚠️ .env 文件不存在');
    return false;
  }
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    let loaded = 0;
    
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        const cleanKey = key.trim();
        let cleanValue = value.trim();
        
        // 移除引号
        if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
            (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
          cleanValue = cleanValue.slice(1, -1);
        }
        
        if (!process.env[cleanKey]) {
          process.env[cleanKey] = cleanValue;
          loaded++;
        }
      }
    }
    
    console.log(`✅ .env 文件加载成功，加载了 ${loaded} 个变量`);
    return true;
  } catch (error) {
    console.error('❌ 加载 .env 文件失败:', error);
    return false;
  }
}

// 加载环境变量
loadEnv();

// 验证关键环境变量
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TON_API_KEY', 'JWT_SECRET'];
const optional = ['TELEGRAM_ADMIN_BOT_TOKEN'];

const missing = required.filter(key => !process.env[key]);
const missingOptional = optional.filter(key => !process.env[key] || process.env[key]?.includes('test') || process.env[key]?.includes('placeholder'));

if (missing.length > 0) {
  console.error('❌ 缺少必需的环境变量:', missing.join(', '));
  console.log('\n💡 请检查 .env 文件是否包含所需变量');
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.warn('⚠️ 缺少可选环境变量:', missingOptional.join(', '));
  console.log('💡 某些功能可能无法使用，请参考 docs/TELEGRAM_BOT_SETUP.md');
}

console.log('✅ 环境变量验证通过');

import { config as appConfig, printConfig } from '../config/env.js';
import { startTelegramBot } from './bot/index.js';
import { startPriceAdjustJob } from './jobs/priceAdjust.js';
import { startAccelerateJob } from './jobs/accelerate.js';
import { startOfficialCreateJob } from './jobs/officialCreate.js';
import { startTonPaymentListener } from './listeners/tonPayment.js';
import app from './index.js';

// 打印环境变量摘要
if (appConfig.server.isDevelopment) {
  console.log('\n📊 环境变量摘要:');
  console.log(`  - SUPABASE_URL: ${process.env.SUPABASE_URL?.substring(0, 30)}...`);
  console.log(`  - TELEGRAM_ADMIN_BOT_TOKEN: ${process.env.TELEGRAM_ADMIN_BOT_TOKEN?.substring(0, 15)}...`);
  console.log(`  - TON_API_KEY: ${process.env.TON_API_KEY?.substring(0, 15)}...`);
  console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET?.substring(0, 15)}...`);
}

console.log('🚀 启动 Taizhunle 服务器...');

// 启动后台服务
console.log('📡 启动后台服务...');

// 启动 Telegram Bot
try {
  startTelegramBot();
  console.log('✅ Telegram Bot 启动成功');
} catch (error) {
  console.error('❌ Telegram Bot 启动失败:', error);
}

// 启动 TON 支付监听器
try {
  startTonPaymentListener();
  console.log('✅ TON 支付监听器启动成功');
} catch (error) {
  console.error('❌ TON 支付监听器启动失败:', error);
}

// 启动定时任务
if (appConfig.features.priceAdjustment) {
  try {
    startPriceAdjustJob();
    console.log('✅ 价格调整任务启动成功');
  } catch (error) {
    console.error('❌ 价格调整任务启动失败:', error);
  }
}

if (appConfig.features.acceleratePeriod) {
  try {
    startAccelerateJob();
    console.log('✅ 加速期任务启动成功');
  } catch (error) {
    console.error('❌ 加速期任务启动失败:', error);
  }
}

if (appConfig.features.officialRainCreation) {
  try {
    startOfficialCreateJob();
    console.log('✅ 官方雨露任务启动成功');
  } catch (error) {
    console.error('❌ 官方雨露任务启动失败:', error);
  }
}

// 启动 HTTP 服务器，如果端口被占用则尝试其他端口
let port = appConfig.server.port;
const maxRetries = 10;
let retries = 0;

function startServer(currentPort: number): void {
  const server = app.listen(currentPort, () => {
    console.log('\n🎉 Taizhunle 服务器启动完成!');
    console.log(`📍 地址: http://localhost:${currentPort}`);
    console.log(`🌐 环境: ${appConfig.server.nodeEnv}`);
    console.log(`🔗 TON 网络: ${appConfig.ton.network}`);
    
    if (appConfig.server.isDevelopment) {
      console.log('\n🔧 开发模式功能:');
      console.log(`  - 配置查看: http://localhost:${currentPort}/api/config`);
      console.log(`  - 健康检查: http://localhost:${currentPort}/health`);
      console.log(`  - Mock 数据: ${appConfig.features.mockData ? '启用' : '禁用'}`);
    }
    
    printConfig();
    
    // 设置优雅关闭
    setupGracefulShutdown(server);
  });
  
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE' && retries < maxRetries) {
      retries++;
      const nextPort = currentPort + 1;
      console.log(`⚠️ 端口 ${currentPort} 被占用，尝试端口 ${nextPort}...`);
      setTimeout(() => startServer(nextPort), 1000);
    } else {
      console.error('❌ 服务器启动失败:', error);
      process.exit(1);
    }
  });
}

// 优雅关闭函数
function setupGracefulShutdown(server: any) {
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 收到 ${signal} 信号，正在关闭服务器...`);
    
    server.close(() => {
      console.log('✅ HTTP 服务器已关闭');
      console.log('👋 服务器已完全关闭');
      process.exit(0);
    });
    
    // 强制关闭超时
    setTimeout(() => {
      console.error('❌ 强制关闭服务器');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // 未捕获异常处理
  process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获异常:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的 Promise 拒绝:', reason);
    console.error('Promise:', promise);
  });
}

// 启动服务器
startServer(port);

// 优雅关闭已在 setupGracefulShutdown 函数中处理
