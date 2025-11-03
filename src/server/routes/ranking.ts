import express from 'express';
import { fetchRanking, fetchUserRank, type RankingType } from '../services/rankingAnalytics.js';
import { resolveUserId } from '../utils/user.js';

const router = express.Router();

router.get('/:type', async (req, res) => {
  try {
    const type = (req.params.type ?? 'invite') as RankingType;
    const ranking = await fetchRanking(type, 50);
    res.json(ranking);
  } catch (error) {
    console.error('Ranking list error:', error);
    res.status(500).json({ error: 'Failed to load ranking list' });
  }
});

router.get('/:type/user/:identifier', async (req, res) => {
  try {
    const type = (req.params.type ?? 'invite') as RankingType;
    const userId = await resolveUserId(req.params.identifier);
    if (!userId) {
      return res.json({ rank: null });
    }

    const rank = await fetchUserRank(type, userId);
    res.json({ rank });
  } catch (error) {
    console.error('Ranking user error:', error);
    res.status(500).json({ error: 'Failed to load user rank' });
  }
});

export default router;
