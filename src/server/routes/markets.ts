import { Router, type Request, type Response } from 'express';
import {
  createMarketDraft,
  getMarketCreationPermission,
  getMarketDetail,
  getMarketLive,
  getMarketOdds,
  getMarketSnapshot,
  listMarkets,
  placeBet,
} from '../services/marketService.js';
import * as mockMarketService from '../services/mockMarketService.js';
import { normalizeTonAddress } from '../utils/ton.js';

// 检查是否使用 Mock 服务
const useMockService = process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_DATA === 'true';

const router = Router();

router.get('/creation/permission', async (req: Request, res: Response) => {
  try {
    const wallet = typeof req.query.wallet === 'string' ? req.query.wallet : '';

    if (!wallet) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    if (useMockService) {
      const permission = await mockMarketService.getCreationPermission(wallet);
      res.json(permission);
      return;
    }

    const permission = await getMarketCreationPermission(normalizeTonAddress(wallet));
    res.json(permission);
  } catch (error) {
    console.error('Failed to load creation permission:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to load permission' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    if (useMockService) {
      const response = await mockMarketService.listMarkets();
      res.json(response);
      return;
    }
    
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

router.post('/', async (req: Request, res: Response) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const closesAt = typeof req.body?.closesAt === 'string' ? req.body.closesAt : '';
    const minStake = Number(req.body?.minStake);
    const maxStake = Number(req.body?.maxStake);
    const wallet = typeof req.body?.creatorWallet === 'string' ? req.body.creatorWallet.trim() : '';
    const rewardTai = Number(req.body?.rewardTai ?? req.body?.jurorRewardTai ?? req.body?.creationReward);

    if (
      !title ||
      !closesAt ||
      !Number.isFinite(minStake) ||
      !Number.isFinite(maxStake) ||
      !Number.isFinite(rewardTai) ||
      !wallet
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (useMockService) {
      const draft = await mockMarketService.createMarketDraft({
        title,
        closesAt,
        minStake,
        maxStake,
        rewardTai,
      });
      res.json(draft);
      return;
    }

    const draft = await createMarketDraft({
      title,
      closesAt,
      minStake,
      maxStake,
      creatorWallet: normalizeTonAddress(wallet),
      rewardTai,
    });
    res.json(draft);
  } catch (error) {
    console.error('Failed to create market draft:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create market' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const market = useMockService 
      ? await mockMarketService.getMarketDetail(req.params.id)
      : await getMarketDetail(req.params.id);
    res.json(market);
  } catch (error) {
    console.error('Failed to load market detail:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Market not found' });
  }
});

router.get('/:id/snapshot', async (req: Request, res: Response) => {
  try {
    const snapshot = useMockService
      ? await mockMarketService.getMarketSnapshot(req.params.id)
      : await getMarketSnapshot(req.params.id);
    res.json(snapshot);
  } catch (error) {
    console.error('Failed to load market snapshot:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Snapshot not available' });
  }
});

router.get('/:id/odds', async (req: Request, res: Response) => {
  try {
    const odds = useMockService
      ? await mockMarketService.getMarketOdds(req.params.id)
      : await getMarketOdds(req.params.id);
    res.json(odds);
  } catch (error) {
    console.error('Failed to load market odds:', error);
    res.status(404).json({ error: error instanceof Error ? error.message : 'Odds not available' });
  }
});

router.get('/:id/live', async (req: Request, res: Response) => {
  try {
    const live = useMockService
      ? await mockMarketService.getMarketLive(req.params.id)
      : await getMarketLive(req.params.id);
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

    if (useMockService) {
      const updated = await mockMarketService.placeBet({
        marketId: req.params.id,
        amount,
        side,
        walletAddress,
        note: typeof req.body?.note === 'string' ? req.body.note : undefined,
      });
      res.json({ success: true, market: updated });
      return;
    }

    const updated = await placeBet({
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

    res.json({ success: true, market: updated });
  } catch (error) {
    console.error('Failed to place bet:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to place bet' });
  }
});

export { router as marketsRouter };
