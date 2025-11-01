/**
 * DAO Fee Distributor Service
 * 分账分发器 - 将预测市场手续费分配到各个 DAO 池
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fee rates in basis points (1 bp = 0.01%)
const FEE_CREATE = parseInt(process.env.FEE_CREATE || '500'); // 0.5%
const FEE_JURY = parseInt(process.env.FEE_JURY || '1000'); // 1.0%
const FEE_INVITE = parseInt(process.env.FEE_INVITE || '500'); // 0.5%
const FEE_PLATFORM = parseInt(process.env.FEE_PLATFORM || '500'); // 0.5%
const FEE_RESERVE = parseInt(process.env.FEE_RESERVE || '2500'); // 2.5%

const BASIS_POINTS = 10000;

export interface FeeMap {
  create: number;
  jury: number;
  invite: number;
  platform: number;
  reserve: number;
}

/**
 * 计算分账金额
 * @param pool 奖池总额（TAI）
 * @returns 各角色分账金额
 */
export function distributeFees(pool: number): FeeMap {
  return {
    create: Math.floor((pool * FEE_CREATE) / BASIS_POINTS),
    jury: Math.floor((pool * FEE_JURY) / BASIS_POINTS),
    invite: Math.floor((pool * FEE_INVITE) / BASIS_POINTS),
    platform: Math.floor((pool * FEE_PLATFORM) / BASIS_POINTS),
    reserve: Math.floor((pool * FEE_RESERVE) / BASIS_POINTS),
  };
}

/**
 * 发送分账到各个 DAO 池
 * @param fees 分账金额
 * @param betId 预测市场 ID
 * @param creatorId 创建者 ID
 * @param juryIds 陪审员 ID 列表
 * @param inviterId 邀请者 ID
 */
export async function sendToPools(
  fees: FeeMap,
  betId: string,
  creatorId?: string,
  juryIds?: string[],
  inviterId?: string,
): Promise<void> {
  const records = [];

  // 创建者收益
  if (fees.create > 0 && creatorId) {
    records.push({
      pool_type: 'create',
      amount: fees.create,
      bet_id: betId,
      user_id: creatorId,
      status: 'pending',
    });
  }

  // 陪审员收益（平分）
  if (fees.jury > 0 && juryIds && juryIds.length > 0) {
    const juryAmount = Math.floor(fees.jury / juryIds.length);
    juryIds.forEach((juryId) => {
      records.push({
        pool_type: 'jury',
        amount: juryAmount,
        bet_id: betId,
        user_id: juryId,
        status: 'pending',
      });
    });
  }

  // 邀请者收益
  if (fees.invite > 0 && inviterId) {
    records.push({
      pool_type: 'invite',
      amount: fees.invite,
      bet_id: betId,
      user_id: inviterId,
      status: 'pending',
    });
  }

  // 平台收益
  if (fees.platform > 0) {
    records.push({
      pool_type: 'platform',
      amount: fees.platform,
      bet_id: betId,
      status: 'pending',
    });
  }

  // 储备金
  if (fees.reserve > 0) {
    records.push({
      pool_type: 'reserve',
      amount: fees.reserve,
      bet_id: betId,
      status: 'pending',
    });
  }

  // 批量插入
  if (records.length > 0) {
    const { error } = await supabase.from('dao_pool').insert(records);

    if (error) {
      console.error('Failed to insert DAO pool records:', error);
      throw new Error(`DAO pool insertion failed: ${error.message}`);
    }
  }
}

/**
 * 获取用户待领取的 DAO 收益
 * @param userId 用户 ID
 * @returns 待领取总额
 */
export async function getUserPendingDao(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('dao_pool')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Failed to get user pending DAO:', error);
    return 0;
  }

  return data?.reduce((sum, record) => sum + record.amount, 0) || 0;
}

/**
 * 获取用户 DAO 统计
 * @param userId 用户 ID
 * @returns DAO 统计信息
 */
export async function getUserDaoStats(userId: string) {
  const { data, error } = await supabase
    .from('mv_user_dao_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Failed to get user DAO stats:', error);
    return null;
  }

  return data;
}

/**
 * 领取 DAO 收益
 * @param userId 用户 ID
 * @param txHash 交易哈希
 * @returns 领取的总额
 */
export async function claimDaoPool(userId: string, txHash: string): Promise<number> {
  // 获取待领取记录
  const { data: pendingRecords, error: fetchError } = await supabase
    .from('dao_pool')
    .select('id, amount')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (fetchError || !pendingRecords || pendingRecords.length === 0) {
    return 0;
  }

  const totalAmount = pendingRecords.reduce((sum, record) => sum + record.amount, 0);
  const recordIds = pendingRecords.map((r) => r.id);

  // 更新为已领取
  const { error: updateError } = await supabase
    .from('dao_pool')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      tx_hash: txHash,
    })
    .in('id', recordIds);

  if (updateError) {
    console.error('Failed to claim DAO pool:', updateError);
    throw new Error(`DAO claim failed: ${updateError.message}`);
  }

  return totalAmount;
}

/**
 * 获取 DAO 池统计（全局）
 * @returns 各池子的统计信息
 */
export async function getDaoPoolStats() {
  const { data, error } = await supabase
    .from('dao_pool')
    .select('pool_type, status, amount')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get DAO pool stats:', error);
    return null;
  }

  const stats = {
    create: { pending: 0, claimed: 0, total: 0 },
    jury: { pending: 0, claimed: 0, total: 0 },
    invite: { pending: 0, claimed: 0, total: 0 },
    platform: { pending: 0, claimed: 0, total: 0 },
    reserve: { pending: 0, claimed: 0, total: 0 },
  };

  data?.forEach((record) => {
    const type = record.pool_type as keyof typeof stats;
    if (stats[type]) {
      stats[type].total += record.amount;
      if (record.status === 'pending') {
        stats[type].pending += record.amount;
      } else if (record.status === 'claimed') {
        stats[type].claimed += record.amount;
      }
    }
  });

  return stats;
}
