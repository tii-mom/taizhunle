import { Router, type Request, type Response } from 'express';

const router = Router();

// GET /api/redpacket/status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    const status = {
      priceTON: 9.99,
      soldTAI: 750000,
      totalTAI: 1000000,
      countdown: Date.now() + 1000 * 60 * 60 * 23,
      soldOut: false,
      accelerate: false,
      priceAdjustment: 0,
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching redpacket status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// POST /api/redpacket/create
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // TODO: Generate payment address and memo
    const result = {
      address: 'EQD...mock',
      memo: 'REDPACKET-' + Date.now(),
      priceTON: 9.99,
      baseTAI: 700000,
      maxTAI: 1300000,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };

    res.json(result);
  } catch (error) {
    console.error('Error creating redpacket:', error);
    res.status(500).json({ error: 'Failed to create redpacket' });
  }
});

// POST /api/redpacket/claim
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const { wallet, redpacketId } = req.body;

    if (!wallet || !redpacketId) {
      return res.status(400).json({ error: 'Wallet and redpacketId required' });
    }

    // TODO: Generate unsigned BOC for claim
    const result = {
      unsignedBoc: 'te6cc...mock',
      amount: 50000,
      marketId: redpacketId,
    };

    res.json(result);
  } catch (error) {
    console.error('Error claiming redpacket:', error);
    res.status(500).json({ error: 'Failed to claim redpacket' });
  }
});

// POST /api/redpacket/claim/submit
router.post('/claim/submit', async (req: Request, res: Response) => {
  try {
    const { signature, wallet } = req.body;

    if (!signature || !wallet) {
      return res.status(400).json({ error: 'Signature and wallet required' });
    }

    // TODO: Submit signed transaction
    const result = {
      txHash: '0x' + Date.now().toString(16),
      success: true,
    };

    res.json(result);
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

export { router as redpacketRouter };
