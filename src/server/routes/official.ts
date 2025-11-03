import { Router, type Request, type Response } from 'express';
import { claimOfficialRain, getNextOfficialRain } from '../services/officialRainService.js';

const router = Router();

router.get('/next', async (_req: Request, res: Response) => {
  try {
    const next = await getNextOfficialRain();
    if (!next) {
      res.status(404).json({ error: 'No scheduled rain' });
      return;
    }
    res.json(next);
  } catch (error) {
    console.error('Error fetching official rain:', error);
    res.status(500).json({ error: 'Failed to fetch official rain' });
  }
});

router.post('/claim', async (req: Request, res: Response) => {
  try {
    const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';
    const telegramId = req.body?.telegramId ? Number(req.body.telegramId) : undefined;
    const telegramUsername = typeof req.body?.telegramUsername === 'string' ? req.body.telegramUsername : undefined;

    if (!wallet) {
      res.status(400).json({ error: 'Wallet is required' });
      return;
    }

    const result = await claimOfficialRain({
      wallet,
      telegramId,
      telegramUsername,
    });
    res.json(result);
  } catch (error) {
    console.error('Error claiming official rain:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to claim official rain' });
  }
});

export { router as officialRouter };
