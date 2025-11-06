import { Router, type Request, type Response } from 'express';

import { getMarketNews, listHotTopics, resolveLimit } from '../services/marketInsightsService.js';
import * as mockMarketService from '../services/mockMarketService.js';
import { filterMarketTags } from '../../constants/marketTags.js';

const useMockService = process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_DATA === 'true';

const router = Router();

router.get('/hot-topics', async (req: Request, res: Response) => {
  try {
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const limit = resolveLimit(req, 10);
    const topics = useMockService
      ? await mockMarketService.listHotTopics({ tag, limit })
      : await listHotTopics({ tag, limit });
    res.json({ items: topics });
  } catch (error) {
    console.error('Failed to load hot topics:', error);
    res.status(500).json({ error: 'Failed to load hot topics' });
  }
});

router.get('/markets/:id/news', async (req: Request, res: Response) => {
  try {
    const marketId = req.params.id;
    if (!marketId) {
      res.status(400).json({ error: 'Market id is required' });
      return;
    }
    const rawTags = Array.isArray(req.query.tags)
      ? (req.query.tags as string[])
      : (typeof req.query.tags === 'string' ? req.query.tags.split(',') : []);
    const tags = filterMarketTags(rawTags);

    const news = useMockService
      ? await mockMarketService.getMarketNews(marketId)
      : await getMarketNews(marketId, tags);
    res.json({ items: news });
  } catch (error) {
    console.error('Failed to load market news:', error);
    res.status(500).json({ error: 'Failed to load market news' });
  }
});

export default router;
