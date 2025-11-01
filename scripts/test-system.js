#!/usr/bin/env node

// Taizhunle 系统测试脚本

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 手动加载 .env 文件
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    return false;
  }
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
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
        }
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

// 加载环境变量
loadEnv();

console.log('🧪 Taizhunle 系统测试开始...\n');

// 测试环境变量
function testEnvironment() {
  console.log('1️⃣ 测试环境变量...');
  
  const envPath = join(process.cwd(), '.env');
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#') && line.includes('=')
    );
    
    console.log(`   ✅ .env 文件存在，包含 ${lines.length} 个配置项`);
    
    // 检查关键变量
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TON_API_KEY', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length === 0) {
      console.log('   ✅ 所有必需环境变量已配置');
    } else {
      console.log(`   ⚠️ 缺少环境变量: ${missing.join(', ')}`);
    }
  } catch (error) {
    console.log('   ❌ .env 文件读取失败');
  }
}

// 测试服务器连接
async function testServer() {
  console.log('\n2️⃣ 测试服务器连接...');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ 后端服务器运行正常');
      console.log(`   📊 状态: ${data.status}, 环境: ${data.environment}`);
    } else {
      console.log('   ❌ 后端服务器响应异常');
    }
  } catch (error) {
    console.log('   ❌ 无法连接后端服务器 (请确保服务器已启动)');
  }
  
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('   ✅ 前端服务器运行正常');
    } else {
      console.log('   ❌ 前端服务器响应异常');
    }
  } catch (error) {
    console.log('   ❌ 无法连接前端服务器 (请确保服务器已启动)');
  }
}

// 测试 API 端点
async function testAPI() {
  console.log('\n3️⃣ 测试 API 端点...');
  
  const endpoints = [
    { path: '/api/config', name: '配置信息' },
    { path: '/health', name: '健康检查' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3001${endpoint.path}`);
      if (response.ok) {
        console.log(`   ✅ ${endpoint.name} API 正常`);
      } else {
        console.log(`   ❌ ${endpoint.name} API 异常 (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} API 连接失败`);
    }
  }
}

// 测试数据库连接
async function testDatabase() {
  console.log('\n4️⃣ 测试数据库连接...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('   ⚠️ Supabase 配置缺失');
    return;
  }
  
  try {
    // 简单的 ping 测试
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok || response.status === 404) {
      console.log('   ✅ Supabase 连接正常');
    } else {
      console.log(`   ❌ Supabase 连接异常 (${response.status})`);
    }
  } catch (error) {
    console.log('   ❌ Supabase 连接失败');
  }
}

// 生成测试报告
function generateReport() {
  console.log('\n📊 测试报告:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🟢 系统状态: 开发环境运行中');
  console.log('🔧 前端: http://localhost:5173');
  console.log('🔧 后端: http://localhost:3001');
  console.log('📚 文档: docs/CURRENT_STATUS.md');
  console.log('🤖 Bot 设置: docs/TELEGRAM_BOT_SETUP.md');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 下一步:');
  console.log('1. 设置真实 Telegram Bot Token');
  console.log('2. 部署 TON 智能合约');
  console.log('3. 完善前端界面');
  console.log('4. 进行端到端测试');
}

// 运行所有测试
async function runTests() {
  testEnvironment();
  await testServer();
  await testAPI();
  await testDatabase();
  generateReport();
}

// 启动测试
runTests().catch(console.error);