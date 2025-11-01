#!/usr/bin/env node

/**
 * 环境变量设置脚本
 * Environment Setup Script
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 问题配置
const questions = [
  {
    key: 'SUPABASE_URL',
    question: '请输入 Supabase 项目 URL (https://xxx.supabase.co):',
    required: true,
    validate: (value) => value.startsWith('https://') && value.includes('supabase.co')
  },
  {
    key: 'SUPABASE_ANON_KEY',
    question: '请输入 Supabase Anon Key:',
    required: true,
    validate: (value) => value.length > 100
  },
  {
    key: 'SUPABASE_SERVICE_KEY',
    question: '请输入 Supabase Service Role Key:',
    required: true,
    validate: (value) => value.length > 100
  },
  {
    key: 'TELEGRAM_ADMIN_BOT_TOKEN',
    question: '请输入 Telegram 管理员 Bot Token:',
    required: true,
    validate: (value) => value.includes(':')
  },
  {
    key: 'TELEGRAM_CHANNEL_ID',
    question: '请输入 Telegram 频道 ID (例: -1001234567890):',
    required: true,
    validate: (value) => value.startsWith('-100')
  },
  {
    key: 'TELEGRAM_ADMIN_IDS',
    question: '请输入管理员 Telegram ID (逗号分隔):',
    required: true,
    validate: (value) => /^\d+(,\d+)*$/.test(value)
  },
  {
    key: 'TON_API_KEY',
    question: '请输入 TON API Key (从 @tonapibot 获取):',
    required: true,
    validate: (value) => value.length > 10
  },
  {
    key: 'JWT_SECRET',
    question: '请输入 JWT 密钥 (至少32位字符):',
    required: true,
    validate: (value) => value.length >= 32,
    default: () => generateRandomString(64)
  },
  {
    key: 'ENCRYPTION_KEY',
    question: '请输入加密密钥 (32位字符):',
    required: true,
    validate: (value) => value.length === 32,
    default: () => generateRandomString(32)
  }
];

// 生成随机字符串
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 询问问题
function askQuestion(question) {
  return new Promise((resolve) => {
    const prompt = question.default 
      ? `${question.question} [默认: ${question.default()}]`
      : question.question;
    
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, (answer) => {
      if (!answer && question.default) {
        answer = question.default();
      }
      
      if (question.required && !answer) {
        colorLog('red', '❌ 此项为必填项，请重新输入');
        resolve(askQuestion(question));
        return;
      }
      
      if (question.validate && !question.validate(answer)) {
        colorLog('red', '❌ 输入格式不正确，请重新输入');
        resolve(askQuestion(question));
        return;
      }
      
      resolve(answer);
    });
  });
}

// 主函数
async function main() {
  colorLog('bright', '🚀 Taizhunle 环境配置向导');
  colorLog('yellow', '请按照提示输入配置信息，按 Ctrl+C 退出\n');
  
  // 检查是否已存在 .env 文件
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await new Promise((resolve) => {
      rl.question(`${colors.yellow}⚠️  .env 文件已存在，是否覆盖? (y/N): ${colors.reset}`, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (!overwrite) {
      colorLog('blue', '👋 配置已取消');
      rl.close();
      return;
    }
  }
  
  const config = {};
  
  // 逐个询问配置项
  for (const question of questions) {
    colorLog('magenta', `\n📝 配置 ${question.key}:`);
    config[question.key] = await askQuestion(question);
  }
  
  // 生成 .env 文件内容
  const envContent = generateEnvContent(config);
  
  // 写入文件
  try {
    fs.writeFileSync(envPath, envContent);
    colorLog('green', '\n✅ .env 文件创建成功!');
    colorLog('blue', '📁 文件位置: ' + envPath);
    
    // 显示下一步
    colorLog('yellow', '\n📋 下一步操作:');
    console.log('1. 检查并完善 .env 文件中的其他配置项');
    console.log('2. 运行 npm install 安装依赖');
    console.log('3. 运行 npm run dev 启动开发服务器');
    console.log('4. 访问 http://localhost:5173 查看应用');
    
  } catch (error) {
    colorLog('red', '❌ 创建 .env 文件失败: ' + error.message);
  }
  
  rl.close();
}

// 生成 .env 文件内容
function generateEnvContent(config) {
  const template = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  
  let content = template;
  
  // 替换配置项
  Object.entries(config).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    content = content.replace(regex, `${key}=${value}`);
  });
  
  return content;
}

// 错误处理
process.on('SIGINT', () => {
  colorLog('yellow', '\n👋 配置已取消');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  colorLog('red', '❌ 发生错误: ' + error.message);
  process.exit(1);
});

// 运行主函数
main().catch((error) => {
  colorLog('red', '❌ 配置失败: ' + error.message);
  process.exit(1);
});