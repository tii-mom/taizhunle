import { Router, type Request, type Response } from 'express';

const router = Router();

// GET /api/official/next
router.get('/next', async (_req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    const nextRound = {
      nextAt: Date.now() + 1000 * 60 * 60 * 2,
      remaining: 50,
      qualify: true,
      ticketPrice: 0.3,
      amountTAI: 10000000,
    };

    res.json(nextRound);
  } catch (error) {
    console.error('Error fetching official rain:', error);
    res.status(500).json({ error: 'Failed to fetch official rain' });
  }
});

// POST /api/official/claim
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { wallet, tgId } = req.body;

    if (!wallet || !tgId) {
      return res.status(400).json({ error: 'Wallet and tgId required' });
    }

    // TODO: Verify qualification and generate unsigned BOC
    const result = {
      unsignedBoc: 'te6cc...mock',
      amount: 10000000,
      qualified: true,
    };

    res.json(result);
  } catch (error) {
    console.error('Error claiming official rain:', error);
    res.status(500).json({ error: 'Failed to claim official rain' });
  }
});

export { router as officialRouter };
