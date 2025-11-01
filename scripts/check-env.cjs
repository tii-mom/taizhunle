#!/usr/bin/env node

/**
 * 简单的环境变量检查脚本
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查 .env 文件是否存在
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  colorLog('red', '❌ .env 文件不存在');
  colorLog('yellow', '💡 请运行 npm run setup 创建环境配置');
  process.exit(1);
}

// 读取 .env 文件
require('dotenv').config();

// 必需的环境变量
const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'TELEGRAM_ADMIN_BOT_TOKEN',
  'TON_API_KEY',
  'JWT_SECRET',
];

// 可选但推荐的环境变量
const recommended = [
  'SUPABASE_SERVICE_KEY',
  'TELEGRAM_CHANNEL_ID',
  'TELEGRAM_ADMIN_IDS',
  'ENCRYPTION_KEY',
];

// 检查必需变量
const missing = required.filter(key => !process.env[key]);
const missingRecommended = recommended.filter(key => !process.env[key]);

if (missing.length > 0) {
  colorLog('red', '❌ 缺少必需的环境变量:');
  missing.forEach(key => console.log(`  - ${key}`));
  colorLog('yellow', '\n💡 请运行 npm run setup 配置环境变量');
  process.exit(1);
}

colorLog('green', '✅ 必需的环境变量检查通过');

if (missingRecommended.length > 0) {
  colorLog('yellow', '⚠️  缺少推荐的环境变量:');
  missingRecommended.forEach(key => console.log(`  - ${key}`));
}

// 验证格式
const validations = [
  {
    key: 'SUPABASE_URL',
    test: (value) => value.startsWith('https://') && value.includes('supabase.co'),
    message: 'SUPABASE_URL 格式不正确，应为 https://xxx.supabase.co'
  },
  {
    key: 'TELEGRAM_ADMIN_BOT_TOKEN',
    test: (value) => value.includes(':'),
    message: 'TELEGRAM_ADMIN_BOT_TOKEN 格式不正确，应包含冒号'
  },
  {
    key: 'JWT_SECRET',
    test: (value) => value.length >= 32,
    message: 'JWT_SECRET 长度不足，应至少 32 位字符'
  }
];

let hasFormatError = false;
validations.forEach(({ key, test, message }) => {
  const value = process.env[key];
  if (value && !test(value)) {
    if (!hasFormatError) {
      colorLog('yellow', '\n⚠️  环境变量格式问题:');
      hasFormatError = true;
    }
    console.log(`  - ${message}`);
  }
});

if (!hasFormatError) {
  colorLog('green', '✅ 环境变量格式验证通过');
}

// 显示当前配置摘要
colorLog('cyan', '\n📋 当前配置摘要:');
console.log(`  - 环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`  - 端口: ${process.env.PORT || '3000'}`);
console.log(`  - TON 网络: ${process.env.TON_NETWORK || 'testnet'}`);
console.log(`  - Mock 数据: ${process.env.ENABLE_MOCK_DATA || 'true'}`);
console.log(`  - 红包价格: ${process.env.REDPACKET_PRICE_TON || '9.99'} TON`);

colorLog('green', '\n🎉 环境配置检查完成！');