#!/usr/bin/env node

// 手动运行数据库迁移

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

console.log('🚀 运行数据库迁移...\n');

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Supabase 配置缺失');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    console.log('✅ Supabase 客户端创建成功');
    
    // 读取红包迁移文件
    const migrationPath = join(process.cwd(), 'supabase/migrations/20251030_redpacket.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 执行红包迁移...');
    
    // 分割SQL语句并逐个执行
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ SQL 执行警告: ${error.message}`);
          }
        } catch (err) {
          console.log(`⚠️ SQL 执行错误: ${err.message}`);
        }
      }
    }
    
    console.log('✅ 迁移执行完成');
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建...');
    
    const tables = ['redpacket_sales', 'redpacket_purchases', 'user_balances'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} 表验证失败: ${error.message}`);
      } else {
        console.log(`✅ ${table} 表创建成功`);
      }
    }
    
    console.log('\n🎉 数据库迁移完成！');
    
  } catch (error) {
    console.log('❌ 迁移失败:', error.message);
  }
}

runMigration().catch(console.error);