import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 无法读取 Supabase 凭证，请确认 .env 已配置 SUPABASE_URL / SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SAMPLE_USERS = [
  {
    wallet_address: 'UQDJsampleWalletAddress0000000000000000000000000000000000',
    telegram_username: 'taizhunle_whale',
    language_code: 'zh',
  },
  {
    wallet_address: 'UQDJsampleWalletAddress1111111111111111111111111111111111',
    telegram_username: 'glass_maker',
    language_code: 'en',
  },
];

type SamplePredictionInput = {
  title: string;
  description: string;
  endOffsetHours: number;
  status: string;
  base_pool: number;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  total_fees: number;
};

const SAMPLE_PREDICTIONS: SamplePredictionInput[] = [
  {
    title: 'BTC 在周五前突破 80,000 美元',
    description: '市场情绪高涨，ETF 流入创下新高。',
    endOffsetHours: 24,
    status: 'active',
    base_pool: 1_000_000,
    total_pool: 820_000,
    yes_pool: 520_000,
    no_pool: 300_000,
    total_fees: 18_000,
  },
  {
    title: 'ETH Staking 年化收益率将在下月跌破 3%',
    description: '上海升级后质押需求回调，验证者开始退出。',
    endOffsetHours: 48,
    status: 'active',
    base_pool: 800_000,
    total_pool: 640_000,
    yes_pool: 280_000,
    no_pool: 360_000,
    total_fees: 14_000,
  },
  {
    title: 'TON 全链 TVL 在本季度再创新高',
    description: '生态激励计划持续发力，跨链资产持续流入。',
    endOffsetHours: 72,
    status: 'approved',
    base_pool: 600_000,
    total_pool: 450_000,
    yes_pool: 310_000,
    no_pool: 140_000,
    total_fees: 11_000,
  },
];

async function ensureUsers() {
  const results: Record<string, string> = {};

  for (const user of SAMPLE_USERS) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'wallet_address' })
      .select('id, wallet_address')
      .single();

    if (error || !data) {
      throw new Error(`创建示例用户失败: ${error?.message ?? 'unknown error'}`);
    }

    results[data.wallet_address] = data.id;
  }

  return results;
}

async function seedPredictions(creatorId: string) {
  const payload = SAMPLE_PREDICTIONS.map((prediction) => ({
    id: randomUUID(),
    title: prediction.title,
    description: prediction.description,
    end_time: new Date(Date.now() + prediction.endOffsetHours * 60 * 60 * 1000).toISOString(),
    status: prediction.status,
    base_pool: prediction.base_pool,
    total_pool: prediction.total_pool,
    yes_pool: prediction.yes_pool,
    no_pool: prediction.no_pool,
    total_fees: prediction.total_fees,
    creator_id: creatorId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('predictions')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    throw new Error(`插入预测数据失败: ${error.message}`);
  }

  return payload;
}

async function seedBets(predictions: { id: string }[], userIds: string[]) {
  const now = Date.now();
  const bets = predictions.flatMap((prediction, index) => {
    return userIds.map((userId, userIndex) => {
      const amount = 25_000 + index * 15_000 + userIndex * 10_000;
      return {
        id: randomUUID(),
        prediction_id: prediction.id,
        user_id: userId,
        side: userIndex % 2 === 0 ? 'yes' : 'no',
        amount,
        odds: userIndex % 2 === 0 ? 1.8 : 2.1,
        potential_payout: Math.round(amount * (userIndex % 2 === 0 ? 1.8 : 2.1)),
        fee_amount: Math.round(amount * 0.05),
        net_amount: Math.round(amount * 0.95),
        status: 'confirmed',
        created_at: new Date(now - (index + userIndex + 1) * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - (index + userIndex + 1) * 60 * 60 * 1000).toISOString(),
      };
    });
  });

  const { error } = await supabase.from('bets').upsert(bets, { onConflict: 'id' });

  if (error) {
    throw new Error(`插入示例下注失败: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 正在写入示例预测数据...');
  const walletMap = await ensureUsers();
  const creatorId = Object.values(walletMap)[0];

  const predictions = await seedPredictions(creatorId);
  await seedBets(predictions, Object.values(walletMap));

  console.log('✅ 示例数据写入完成');
}

main().catch((error) => {
  console.error('❌ 写入示例数据失败:', error);
  process.exit(1);
});
