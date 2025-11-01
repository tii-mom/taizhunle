/**
 * 环境变量加载器
 * Environment Variable Loader
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 手动加载 .env 文件
 * 避免 ES 模块中使用 require 的问题
 */
export function loadEnvFile() {
  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    console.warn('⚠️ .env 文件不存在，使用系统环境变量');
    return;
  }
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // 跳过注释和空行
      if (line.trim() === '' || line.trim().startsWith('#')) {
        continue;
      }
      
      // 解析 KEY=VALUE 格式
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
        
        // 只有在环境变量不存在时才设置
        if (!process.env[cleanKey]) {
          process.env[cleanKey] = cleanValue;
        }
      }
    }
    
    console.log('✅ .env 文件加载成功');
  } catch (error) {
    console.error('❌ 加载 .env 文件失败:', error);
  }
}

/**
 * 验证关键环境变量是否存在
 */
export function validateEnv() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'TELEGRAM_ADMIN_BOT_TOKEN', 
    'TON_API_KEY',
    'JWT_SECRET',
  ];
  
  const missing: string[] = [];
  const loaded: string[] = [];
  
  for (const key of required) {
    if (process.env[key]) {
      loaded.push(key);
    } else {
      missing.push(key);
    }
  }
  
  console.log(`📋 环境变量状态: ${loaded.length}/${required.length} 已加载`);
  
  if (loaded.length > 0) {
    console.log('✅ 已加载的变量:', loaded.join(', '));
  }
  
  if (missing.length > 0) {
    console.error('❌ 缺失的变量:', missing.join(', '));
    return false;
  }
  
  return true;
}

/**
 * 打印环境变量摘要 (隐藏敏感信息)
 */
export function printEnvSummary() {
  const sensitiveKeys = ['TOKEN', 'KEY', 'SECRET', 'PASSWORD', 'PRIVATE'];
  
  console.log('\n📊 环境变量摘要:');
  
  const envVars = Object.keys(process.env)
    .filter(key => key.startsWith('SUPABASE_') || 
                   key.startsWith('TELEGRAM_') || 
                   key.startsWith('TON_') ||
                   key.includes('JWT') ||
                   key.includes('REDPACKET') ||
                   key.includes('OFFICIAL'))
    .sort();
  
  for (const key of envVars) {
    const value = process.env[key];
    if (value) {
      // 检查是否是敏感信息
      const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
      const displayValue = isSensitive 
        ? `${value.substring(0, 8)}...` 
        : value.length > 50 
          ? `${value.substring(0, 47)}...`
          : value;
      
      console.log(`  ${key}: ${displayValue}`);
    }
  }
}