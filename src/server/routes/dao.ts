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
} from '../services/feeDistributor';

const router = express.Router();

/**
 * GET /api/dao/stats/:userId
 * 获取用户 DAO 统计
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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

export default router;
