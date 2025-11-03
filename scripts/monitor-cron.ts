#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: sales } = await supabase
    .from('redpacket_sales')
    .select('sale_code, accelerate, accelerate_rate, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  const { data: rains } = await supabase
    .from('official_rain')
    .select('id, amount_tai, status, start_time, updated_at')
    .order('start_time', { ascending: false })
    .limit(5);

  console.log('Latest redpacket sales:');
  console.table(sales ?? []);
  console.log('Latest official rain drops:');
  console.table(rains ?? []);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
