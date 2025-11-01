import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';

// 延迟初始化 Supabase 客户端
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const { supabaseUrl, supabaseServiceKey } = config.database;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }

    supabaseInstance = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': 'taizhunle-server',
          },
        },
      },
    );
    
    console.log('✅ Supabase 客户端初始化成功');
  }

  return supabaseInstance;
}

// 导出便捷访问器
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  }
});

export type AppSupabaseClient = ReturnType<typeof getSupabaseClient>;
