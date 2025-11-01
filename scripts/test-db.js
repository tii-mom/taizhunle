#!/usr/bin/env node

// 测试数据库连接

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

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

console.log('🧪 测试数据库连接...\n');

console.log('📊 环境变量:');
console.log(`  - SUPABASE_URL: ${process.env.SUPABASE_URL?.substring(0, 30)}...`);
console.log(`  - SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY?.substring(0, 20)}...`);
console.log(`  - SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY?.substring(0, 20)}...`);

async function testDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Supabase 配置缺失');
    return;
  }
  
  try {
    console.log('\n🔗 创建 Supabase 客户端...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    console.log('✅ Supabase 客户端创建成功');
    
    console.log('\n📋 测试表查询...');
    
    // 测试 redpacket_sales 表
    const { data: salesData, error: salesError } = await supabase
      .from('redpacket_sales')
      .select('count')
      .limit(1);
    
    if (salesError) {
      console.log(`❌ redpacket_sales 表查询失败: ${salesError.message}`);
    } else {
      console.log('✅ redpacket_sales 表查询成功');
    }
    
    // 测试 user_balances 表
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('count')
      .limit(1);
    
    if (balanceError) {
      console.log(`❌ user_balances 表查询失败: ${balanceError.message}`);
    } else {
      console.log('✅ user_balances 表查询成功');
    }
    
    console.log('\n🎉 数据库连接测试完成');
    
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
  }
}

testDatabase().catch(console.error);