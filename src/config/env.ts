/**
 * 环境变量配置和验证
 * Environment Configuration and Validation
 */

// 简化的环境变量读取，避免复杂验证导致的启动问题
function getEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseFloat(value) : defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  return value ? value === 'true' : defaultValue;
}

// 导出环境变量对象
export const env = {
  // 基础配置
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  
  // 数据库配置
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),

  // Telegram 配置
  TELEGRAM_ADMIN_BOT_TOKEN: getEnvVar('TELEGRAM_ADMIN_BOT_TOKEN'),
  TELEGRAM_ADMIN_BOT_USERNAME: getEnvVar('TELEGRAM_ADMIN_BOT_USERNAME'),
  TELEGRAM_CHANNEL_ID: getEnvVar('TELEGRAM_CHANNEL_ID'),
  TELEGRAM_ADMIN_IDS: getEnvVar('TELEGRAM_ADMIN_IDS'),
  TELEGRAM_USER_BOT_TOKEN: getEnvVar('TELEGRAM_USER_BOT_TOKEN'),
  TELEGRAM_WEBHOOK_URL: getEnvVar('TELEGRAM_WEBHOOK_URL'),
  TELEGRAM_WEBHOOK_SECRET: getEnvVar('TELEGRAM_WEBHOOK_SECRET'),

  // TON 配置
  TON_NETWORK: getEnvVar('TON_NETWORK', 'testnet'),
  TON_API_ENDPOINT: getEnvVar('TON_API_ENDPOINT', 'https://testnet.toncenter.com/api/v2/'),
  TON_API_KEY: getEnvVar('TON_API_KEY'),
  TAI_TOKEN_CONTRACT: getEnvVar('TAI_TOKEN_CONTRACT'),
  VESTING_CONTRACT: getEnvVar('VESTING_CONTRACT'),
  REDPACKET_CONTRACT: getEnvVar('REDPACKET_CONTRACT'),
  PLATFORM_WALLET_ADDRESS: getEnvVar('PLATFORM_WALLET_ADDRESS'),
  PLATFORM_WALLET_PRIVATE_KEY: getEnvVar('PLATFORM_WALLET_PRIVATE_KEY'),
  REDPACKET_WALLET_ADDRESS: getEnvVar('REDPACKET_WALLET_ADDRESS'),
  REDPACKET_WALLET_PRIVATE_KEY: getEnvVar('REDPACKET_WALLET_PRIVATE_KEY'),

  // 业务配置
  REDPACKET_PRICE_TON: getEnvNumber('REDPACKET_PRICE_TON', 9.99),
  REDPACKET_BASE_AMOUNT: getEnvNumber('REDPACKET_BASE_AMOUNT', 10000),
  REDPACKET_MAX_AMOUNT: getEnvNumber('REDPACKET_MAX_AMOUNT', 200000),
  REDPACKET_ACCELERATE_RATE_NORMAL: getEnvNumber('REDPACKET_ACCELERATE_RATE_NORMAL', 5),
  REDPACKET_ACCELERATE_RATE_BOOST: getEnvNumber('REDPACKET_ACCELERATE_RATE_BOOST', 10),
  OFFICIAL_RAIN_AMOUNT: getEnvNumber('OFFICIAL_RAIN_AMOUNT', 0),
  OFFICIAL_RAIN_TICKET_PRICE: getEnvNumber('OFFICIAL_RAIN_TICKET_PRICE', 0),
  PREDICTION_MIN_POOL: getEnvNumber('PREDICTION_MIN_POOL', 0),
  PREDICTION_FEE_RATE: getEnvNumber('PREDICTION_FEE_RATE', 0),

  // 安全配置
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY'),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // 功能开关
  ENABLE_MOCK_DATA: getEnvBoolean('ENABLE_MOCK_DATA', true),
  ENABLE_PRICE_ADJUSTMENT: getEnvBoolean('ENABLE_PRICE_ADJUSTMENT', true),
  ENABLE_ACCELERATE_PERIOD: getEnvBoolean('ENABLE_ACCELERATE_PERIOD', false),
  ENABLE_OFFICIAL_RAIN_CREATION: getEnvBoolean('ENABLE_OFFICIAL_RAIN_CREATION', false),
};

// 配置对象
export const config = {
  // 服务器配置
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  
  // 数据库配置
  database: {
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
    supabaseServiceKey: env.SUPABASE_SERVICE_KEY,
    databaseUrl: env.DATABASE_URL,
  },
  
  // Telegram 配置
  telegram: {
    adminBot: {
      token: env.TELEGRAM_ADMIN_BOT_TOKEN,
      username: env.TELEGRAM_ADMIN_BOT_USERNAME,
    },
    userBot: {
      token: env.TELEGRAM_USER_BOT_TOKEN,
    },
    channel: {
      id: env.TELEGRAM_CHANNEL_ID,
    },
    adminIds: env.TELEGRAM_ADMIN_IDS.split(',').map(id => parseInt(id.trim())),
    webhook: {
      url: env.TELEGRAM_WEBHOOK_URL,
      secret: env.TELEGRAM_WEBHOOK_SECRET,
    },
  },
  
  // TON 配置
  ton: {
    network: env.TON_NETWORK,
    apiEndpoint: env.TON_API_ENDPOINT,
    apiKey: env.TON_API_KEY,
    contracts: {
      taiToken: env.TAI_TOKEN_CONTRACT,
      vesting: env.VESTING_CONTRACT,
      redpacket: env.REDPACKET_CONTRACT,
    },
    wallets: {
      platform: {
        address: env.PLATFORM_WALLET_ADDRESS,
        privateKey: env.PLATFORM_WALLET_PRIVATE_KEY,
      },
      redpacket: {
        address: env.REDPACKET_WALLET_ADDRESS,
        privateKey: env.REDPACKET_WALLET_PRIVATE_KEY,
      },
    },
  },
  
  // 业务配置
  business: {
    redpacket: {
      priceTon: env.REDPACKET_PRICE_TON,
      baseAmount: env.REDPACKET_BASE_AMOUNT,
      maxAmount: env.REDPACKET_MAX_AMOUNT,
      accelerateRate: {
        normal: env.REDPACKET_ACCELERATE_RATE_NORMAL,
        boost: env.REDPACKET_ACCELERATE_RATE_BOOST,
      },
    },
    officialRain: {
      amount: env.OFFICIAL_RAIN_AMOUNT,
      ticketPrice: env.OFFICIAL_RAIN_TICKET_PRICE,
    },
    prediction: {
      minPool: env.PREDICTION_MIN_POOL,
      feeRate: env.PREDICTION_FEE_RATE,
    },
  },
  
  // 安全配置
  security: {
    jwtSecret: env.JWT_SECRET,
    encryptionKey: env.ENCRYPTION_KEY,
    rateLimit: {
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  
  // 功能开关
  features: {
    mockData: env.ENABLE_MOCK_DATA,
    priceAdjustment: env.ENABLE_PRICE_ADJUSTMENT,
    acceleratePeriod: env.ENABLE_ACCELERATE_PERIOD,
    officialRainCreation: env.ENABLE_OFFICIAL_RAIN_CREATION,
  },
} as const;

// 类型导出
export type Config = typeof config;
export type Env = typeof env;

// 环境检查函数
export function checkRequiredEnv() {
  // 开发模式下跳过严格检查
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 开发模式：跳过严格的环境变量检查');
    return true;
  }
  
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'TELEGRAM_ADMIN_BOT_TOKEN',
    'TON_API_KEY',
    'JWT_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量 / Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}: ${process.env[key] || 'undefined'}`));
    console.error('\n💡 请检查 .env 文件是否存在并包含所需变量');
    return false;
  }
  
  console.log('✅ 必需的环境变量检查通过');
  return true;
}

// 打印配置信息 (开发环境)
export function printConfig() {
  if (config.server.isDevelopment) {
    console.log('🔧 当前配置 / Current Configuration:');
    console.log(`  - 环境 / Environment: ${config.server.nodeEnv}`);
    console.log(`  - 端口 / Port: ${config.server.port}`);
    console.log(`  - TON 网络 / TON Network: ${config.ton.network}`);
    console.log(`  - 数据库 / Database: ${config.database.supabaseUrl}`);
    console.log(`  - Mock 数据 / Mock Data: ${config.features.mockData ? '启用' : '禁用'}`);
    console.log(`  - 红包价格 / RedPacket Price: ${config.business.redpacket.priceTon} TON`);
  }
}

// 默认导出
export default config;
