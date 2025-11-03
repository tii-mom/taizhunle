import express from 'express';
import { resolveUserId } from '../utils/user.js';
import {
  claimInviteRewards,
  fetchInviteFunnel,
  fetchInviteGasFee,
  fetchInviteStats,
} from '../services/inviteAnalytics.js';

const router = express.Router();

router.get('/stats/:identifier', async (req, res) => {
  try {
    const userId = await resolveUserId(req.params.identifier);
    if (!userId) {
      return res.json({
        totalInvites: 0,
        activeTraders: 0,
        pendingEarnings: 0,
        totalEarnings: 0,
        inviteCode: 'TAI-MEMBER',
        gasFee: 0.05,
      });
    }

    const stats = await fetchInviteStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Invite stats error:', error);
    res.status(500).json({ error: 'Failed to load invite stats' });
  }
});

router.get('/funnel/:identifier', async (req, res) => {
  try {
    const userId = await resolveUserId(req.params.identifier);
    if (!userId) {
      return res.json({ clicks: 0, registrations: 0, bets: 0, earnings: 0 });
    }

    const funnel = await fetchInviteFunnel(userId);
    res.json(funnel);
  } catch (error) {
    console.error('Invite funnel error:', error);
    res.status(500).json({ error: 'Failed to load invite funnel' });
  }
});

router.get('/gas-fee/:identifier', async (req, res) => {
  try {
    const userId = await resolveUserId(req.params.identifier);
    if (!userId) {
      return res.json({ gasFee: 0.05 });
    }

    const response = await fetchInviteGasFee(userId);
    res.json(response);
  } catch (error) {
    console.error('Invite gas fee error:', error);
    res.status(500).json({ error: 'Failed to load gas fee' });
  }
});

router.post('/claim', async (req, res) => {
  try {
    const userId = await resolveUserId(req.body?.userId);
    if (!userId) {
      return res.json({ success: false, amount: 0, gasFee: 0.05, txHash: null });
    }

    const result = await claimInviteRewards(userId);
    res.json(result);
  } catch (error) {
    console.error('Invite claim error:', error);
    res.status(500).json({ error: 'Failed to claim invite rewards' });
  }
});

export default router;
