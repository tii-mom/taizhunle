import { Router, type Request, type Response } from 'express';

const router = Router();

// GET /api/whale
router.get('/', async (_req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    const whales = [
      {
        rank: 1,
        wallet: 'EQD...abc',
        amount: 5000000,
        timestamp: Date.now() - 1000 * 60 * 30,
      },
      {
        rank: 2,
        wallet: 'EQD...def',
        amount: 3500000,
        timestamp: Date.now() - 1000 * 60 * 45,
      },
    ];

    res.json(whales);
  } catch (error) {
    console.error('Error fetching whale list:', error);
    res.status(500).json({ error: 'Failed to fetch whale list' });
  }
});

export { router as whaleRouter };
