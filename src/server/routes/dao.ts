/**
 * DAO API Routes
 * DAO 相关的 API 路由
 */

import express from 'express';
import {
  getUserPendingDao,
  getUserDaoStats,
  claimDaoPool,
  getDaoPoolStats,
} from '../services/feeDistributor.js';
import { resolveUserId } from '../utils/user.js';
import { supabase } from '../services/supabaseClient.js';

async function resolveUser(identifier: string | undefined | null) {
  if (!identifier) {
    return { id: null, wallet: null };
  }

  const userId = await resolveUserId(identifier);
  if (!userId) {
    return { id: null, wallet: null };
  }

  const { data: userRow, error } = await supabase
    .from('users')
    .select('id, wallet_address, dao_points, is_juror, total_markets_created, total_creation_fee_tai, win_rate, telegram_username, last_market_created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !userRow) {
    console.error('Failed to load user profile for DAO route:', error?.message ?? 'not found');
    return { id: userId, wallet: null, profile: null };
  }

  return {
    id: userId,
    wallet: userRow.wallet_address,
    profile: userRow,
  };
}

const router = express.Router();

/**
 * GET /api/dao/stats/:userId
 * 获取用户 DAO 统计
 */
router.get('/stats/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { id: userId } = await resolveUser(identifier);

    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await getUserDaoStats(userId);

    if (!stats) {
      return res.json({
        createCount: 0,
        juryCount: 0,
        inviteCount: 0,
        pendingAmount: 0,
        claimedAmount: 0,
        totalAmount: 0,
      });
    }

    return res.json({
      createCount: stats.create_count || 0,
      juryCount: stats.jury_count || 0,
      inviteCount: stats.invite_count || 0,
      pendingAmount: stats.pending_amount || 0,
      claimedAmount: stats.claimed_amount || 0,
      totalAmount: stats.total_amount || 0,
      lastEarningAt: stats.last_earning_at,
      lastClaimAt: stats.last_claim_at,
    });
  } catch (error) {
    console.error('Get DAO stats error:', error);
    return res.status(500).json({ error: 'Failed to get DAO stats' });
  }
});

/**
 * GET /api/dao/pending/:userId
 * 获取用户待领取金额
 */
router.get('/pending/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { id: userId } = await resolveUser(identifier);

    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingAmount = await getUserPendingDao(userId);

    return res.json({ pendingAmount });
  } catch (error) {
    console.error('Get pending DAO error:', error);
    return res.status(500).json({ error: 'Failed to get pending DAO' });
  }
});

/**
 * POST /api/dao/claim
 * 领取 DAO 收益
 */
router.post('/claim', async (req, res) => {
  try {
    const { userId: identifier } = req.body ?? {};

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { id: userId } = await resolveUser(identifier);

    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 检查待领取金额
    const pendingAmount = await getUserPendingDao(userId);

    if (pendingAmount === 0) {
      return res.status(400).json({ error: 'No pending DAO to claim' });
    }

    // 模拟交易哈希（实际应该调用链上合约）
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

    // 领取收益
    const claimedAmount = await claimDaoPool(userId, txHash);

    return res.json({
      success: true,
      claimedAmount,
      txHash,
    });
  } catch (error) {
    console.error('Claim DAO error:', error);
    return res.status(500).json({ error: 'Failed to claim DAO' });
  }
});

/**
 * GET /api/dao/pool-stats
 * 获取 DAO 池统计（全局）
 */
router.get('/pool-stats', async (req, res) => {
  try {
    const stats = await getDaoPoolStats();

    if (!stats) {
      return res.status(500).json({ error: 'Failed to get pool stats' });
    }

    return res.json(stats);
  } catch (error) {
    console.error('Get pool stats error:', error);
    return res.status(500).json({ error: 'Failed to get pool stats' });
  }
});

/**
 * GET /api/dao/profile/:identifier
 * 获取用户 DAO 档案（基础信息 + 余额）
 */
router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { id: userId, wallet, profile } = await resolveUser(identifier);

    if (!userId || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: balanceRow, error: balanceError } = await supabase
      .from('user_balances')
      .select('total_tai, available_tai, locked_tai')
      .eq('wallet_address', wallet ?? '')
      .maybeSingle();

    if (balanceError) {
      console.error('Failed to fetch user balance:', balanceError.message);
    }

    return res.json({
      userId,
      walletAddress: wallet,
      daoPoints: Number(profile.dao_points ?? 0),
      isJuror: Boolean(profile.is_juror),
      totalMarketsCreated: Number(profile.total_markets_created ?? 0),
    totalCreationFeeTai: Number(profile.total_creation_fee_tai ?? 0),
    winRate: Number(profile.win_rate ?? 0),
    lastMarketCreatedAt: profile.last_market_created_at,
    balance: {
      totalTai: Number(balanceRow?.total_tai ?? 0),
      availableTai: Number(balanceRow?.available_tai ?? 0),
        lockedTai: Number(balanceRow?.locked_tai ?? 0),
      },
    });
  } catch (error) {
    console.error('Get DAO profile error:', error);
    return res.status(500).json({ error: 'Failed to load DAO profile' });
  }
});

function assertPositiveAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  return amount;
}

async function loadBalance(walletAddress: string | null | undefined) {
  if (!walletAddress) {
    throw new Error('Wallet address not found for user');
  }

  const { data: balance, error } = await supabase
    .from('user_balances')
    .select('total_tai, available_tai, locked_tai')
    .eq('wallet_address', walletAddress)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  if (!balance) {
    throw new Error('Balance record not found for wallet');
  }

  return {
    available: Number(balance.available_tai ?? 0),
    locked: Number(balance.locked_tai ?? 0),
    total: Number(balance.total_tai ?? 0),
  };
}

/**
 * POST /api/dao/stake
 * 将 TAI 质押为陪审锁仓
 */
router.post('/stake', async (req, res) => {
  try {
    const { userId: identifier, amount } = req.body ?? {};

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stakeAmount = assertPositiveAmount(amount);
    const { id: userId, wallet } = await resolveUser(identifier);

    if (!userId || !wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = await loadBalance(wallet);

    if (balance.available < stakeAmount) {
      return res.status(400).json({ error: 'Insufficient available TAI' });
    }

    const updated = {
      available_tai: balance.available - stakeAmount,
      locked_tai: balance.locked + stakeAmount,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('user_balances')
      .update(updated)
      .eq('wallet_address', wallet);

    if (updateError) {
      throw new Error(`Failed to update balance: ${updateError.message}`);
    }

    return res.json({
      success: true,
      balance: {
        availableTai: updated.available_tai,
        lockedTai: updated.locked_tai,
      },
    });
  } catch (error) {
    console.error('DAO stake error:', error);
    const message = error instanceof Error ? error.message : 'Stake failed';
    const status = error instanceof Error && message === 'Amount must be greater than zero' ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

/**
 * POST /api/dao/unstake
 * 解锁陪审质押
 */
router.post('/unstake', async (req, res) => {
  try {
    const { userId: identifier, amount } = req.body ?? {};

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const unstakeAmount = assertPositiveAmount(amount);
    const { id: userId, wallet } = await resolveUser(identifier);

    if (!userId || !wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = await loadBalance(wallet);

    if (balance.locked < unstakeAmount) {
      return res.status(400).json({ error: 'Locked TAI is insufficient' });
    }

    const updated = {
      available_tai: balance.available + unstakeAmount,
      locked_tai: balance.locked - unstakeAmount,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('user_balances')
      .update(updated)
      .eq('wallet_address', wallet);

    if (updateError) {
      throw new Error(`Failed to update balance: ${updateError.message}`);
    }

    return res.json({
      success: true,
      balance: {
        availableTai: updated.available_tai,
        lockedTai: updated.locked_tai,
      },
    });
  } catch (error) {
    console.error('DAO unstake error:', error);
    const message = error instanceof Error ? error.message : 'Unstake failed';
    const status = error instanceof Error && message === 'Amount must be greater than zero' ? 400 : 500;
    return res.status(status).json({ error: message });
  }
});

/**
 * POST /api/dao/verify
 * 陪审员认证
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId: identifier, telegram, note } = req.body ?? {};

    if (!identifier) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { id: userId, profile } = await resolveUser(identifier);

    if (!userId || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: Record<string, unknown> = {
      is_juror: true,
      updated_at: new Date().toISOString(),
    };

    if (telegram) {
      updates.telegram_username = String(telegram).trim();
    }

    if (note) {
      updates.admin_notes = String(note).slice(0, 280);
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, is_juror, dao_points, telegram_username')
      .single();

    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    return res.json({
      success: true,
      profile: {
        userId,
        isJuror: data?.is_juror ?? true,
        daoPoints: Number(data?.dao_points ?? profile.dao_points ?? 0),
        telegramUsername: data?.telegram_username ?? telegram ?? profile.telegram_username ?? null,
      },
    });
  } catch (error) {
    console.error('DAO verify error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Verification failed' });
  }
});

export default router;
