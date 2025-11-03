import { Router, type Request, type Response } from 'express';
import { fetchWhaleRankings } from '../services/whaleService.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const whales = await fetchWhaleRankings();
    res.json(whales);
  } catch (error) {
    console.error('Error fetching whale list:', error);
    res.status(500).json({ error: 'Failed to fetch whale list' });
  }
});

export { router as whaleRouter };
