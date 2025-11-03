import { Router, type Request, type Response } from 'express';
import {
  getMarketDetail,
  getMarketLive,
  getMarketOdds,
  getMarketSnapshot,
  listMarkets,
  placeBet,
} from '../services/marketService.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await listMarkets({
      sort: req.query.sort as string | undefined,
      filter: req.query.filter as string | undefined,
      cursor: req.query.cursor as string | undefined,
      limit: req.query.limit as string | undefined,
    });
    res.json(response);
  } catch (error) {
    console.error('Failed to list markets:', error);
    res.status(500).json({ error: 'Failed to load markets' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const market = await getMarketDetail(req.params.id);
    res.json(market);
  } catch (error) {
    console.error('Failed to load market detail:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Market not found' });
  }
});

router.get('/:id/snapshot', async (req: Request, res: Response) => {
  try {
    const snapshot = await getMarketSnapshot(req.params.id);
    res.json(snapshot);
  } catch (error) {
    console.error('Failed to load market snapshot:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Snapshot not available' });
  }
});

router.get('/:id/odds', async (req: Request, res: Response) => {
  try {
    const odds = await getMarketOdds(req.params.id);
    res.json(odds);
  } catch (error) {
    console.error('Failed to load market odds:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Odds not available' });
  }
});

router.get('/:id/live', async (req: Request, res: Response) => {
  try {
    const live = await getMarketLive(req.params.id);
    res.json(live);
  } catch (error) {
    console.error('Failed to load live betting data:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Live data not available' });
  }
});

router.post('/:id/bets', async (req: Request, res: Response) => {
  try {
    const amount = Number(req.body?.amount);
    const side = req.body?.side as 'yes' | 'no';
    const walletAddress = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress : '';

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Bet amount must be greater than zero' });
      return;
    }

    if (side !== 'yes' && side !== 'no') {
      res.status(400).json({ error: 'Invalid bet side' });
      return;
    }

    await placeBet({
      marketId: req.params.id,
      walletAddress,
      side,
      amount,
      note: typeof req.body?.note === 'string' ? req.body.note : undefined,
      referrerWallet: typeof req.body?.referrerWallet === 'string' ? req.body.referrerWallet : undefined,
      extras: {
        telegramId: req.body?.telegramId ? Number(req.body.telegramId) : undefined,
        telegramUsername: typeof req.body?.telegramUsername === 'string' ? req.body.telegramUsername : undefined,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to place bet:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to place bet' });
  }
});

export { router as marketsRouter };
