import { Router, type Request, type Response } from 'express';
import {
  createPurchaseSession,
  getCurrentSaleStatus,
  getPurchaseForWallet,
  markPurchaseCompleted,
  schedulePurchaseReconciliation,
} from '../services/redpacketService.js';
import * as mockRedpacketService from '../services/mockRedpacketService.js';
import { isValidTonAddress, normalizeTonAddress } from '../utils/ton.js';

// 检查是否使用 Mock 服务
const useMockService = process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_DATA === 'true';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = useMockService 
      ? await mockRedpacketService.getCurrentSaleStatus()
      : await getCurrentSaleStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching redpacket status:', error);
    
    // 如果真实服务失败，回退到 Mock 服务
    if (!useMockService) {
      try {
        console.log('🔄 回退到 Mock 红包服务');
        const mockStatus = await mockRedpacketService.getCurrentSaleStatus();
        res.json(mockStatus);
        return;
      } catch (mockError) {
        console.error('Mock service also failed:', mockError);
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

router.post('/create', async (req: Request, res: Response) => {
  try {
    const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';

    if (!isValidTonAddress(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const normalizedWallet = normalizeTonAddress(wallet);
    const session = useMockService
      ? await mockRedpacketService.createPurchaseSession(normalizedWallet)
      : await createPurchaseSession(normalizedWallet);
    res.json(session);
  } catch (error) {
    console.error('Error creating redpacket session:', error);
    
    // 如果真实服务失败，回退到 Mock 服务
    if (!useMockService) {
      try {
        console.log('🔄 回退到 Mock 红包服务');
        const normalizedWallet = normalizeTonAddress(req.body?.wallet || '');
        const mockSession = await mockRedpacketService.createPurchaseSession(normalizedWallet);
        res.json(mockSession);
        return;
      } catch (mockError) {
        console.error('Mock service also failed:', mockError);
      }
    }
    
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create redpacket session' });
  }
});

router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const wallet = typeof req.body?.wallet === 'string' ? req.body.wallet.trim() : '';
    const memo = typeof req.body?.memo === 'string' ? req.body.memo.trim() : '';
    const signature = typeof req.body?.signature === 'string' ? req.body.signature.trim() : '';

    if (!isValidTonAddress(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!memo) {
      return res.status(400).json({ error: 'Memo is required' });
    }

    const normalizedWallet = normalizeTonAddress(wallet);
    
    const purchase = useMockService
      ? await mockRedpacketService.getPurchaseForWallet(normalizedWallet, memo)
      : await getPurchaseForWallet(normalizedWallet, memo);

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not ready', status: 'pending' });
    }

    if (signature) {
      if (useMockService) {
        await mockRedpacketService.markPurchaseCompleted(purchase.purchaseId, signature);
      } else {
        await markPurchaseCompleted(purchase.purchaseId, signature);
        schedulePurchaseReconciliation(purchase.purchaseId).catch(error => {
          console.error('Failed to schedule purchase reconciliation', error);
        });
      }
      return res.json({ success: true });
    }

    res.json({
      purchaseId: purchase.purchaseId,
      unsignedBoc: purchase.unsignedBoc,
      amountTAI: purchase.amountTAI,
      tonAmount: purchase.tonAmount,
      memo: purchase.memo,
      accelerate: purchase.accelerate,
      multiplier: purchase.multiplier,
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    
    // 如果真实服务失败，回退到 Mock 服务
    if (!useMockService) {
      try {
        console.log('🔄 回退到 Mock 红包服务');
        const normalizedWallet = normalizeTonAddress(req.body?.wallet || '');
        const memo = req.body?.memo || '';
        const mockPurchase = await mockRedpacketService.getPurchaseForWallet(normalizedWallet, memo);
        
        if (mockPurchase) {
          res.json({
            purchaseId: mockPurchase.purchaseId,
            unsignedBoc: mockPurchase.unsignedBoc,
            amountTAI: mockPurchase.amountTAI,
            tonAmount: mockPurchase.tonAmount,
            memo: mockPurchase.memo,
            accelerate: mockPurchase.accelerate,
            multiplier: mockPurchase.multiplier,
          });
          return;
        }
      } catch (mockError) {
        console.error('Mock service also failed:', mockError);
      }
    }
    
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export { router as redpacketRouter };
