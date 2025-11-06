import { beforeEach, describe, expect, it, vi } from 'vitest';

const cacheMocks = {
  cacheGetZSet: vi.fn(),
  cacheSetZSet: vi.fn(),
  cacheGetHash: vi.fn(),
  cacheSetHash: vi.fn(),
};

let supabaseClientMock: {
  from: ReturnType<typeof vi.fn>;
};

const getSupabaseClientMock = vi.fn(() => supabaseClientMock);
const summarizeContentMock = vi.fn();
const fetchRssArticlesMock = vi.fn();
const searchTweetsMock = vi.fn();

vi.mock('../src/server/lib/cache', () => cacheMocks);
vi.mock('../src/server/services/supabaseClient', () => ({
  getSupabaseClient: () => getSupabaseClientMock(),
}));
vi.mock('../src/server/lib/llm', () => ({
  summarizeContent: (...args: unknown[]) => summarizeContentMock(...args),
}));
vi.mock('../src/server/lib/rss', () => ({
  fetchRssArticles: (...args: unknown[]) => fetchRssArticlesMock(...args),
}));
vi.mock('../src/server/lib/twitter', () => ({
  searchTweets: (...args: unknown[]) => searchTweetsMock(...args),
}));

let service: typeof import('../src/server/services/marketInsightsService');

describe('marketInsightsService', () => {
  beforeEach(async () => {
    vi.resetModules();
    Object.values(cacheMocks).forEach((mockFn) => mockFn.mockReset());
    summarizeContentMock.mockReset();
    fetchRssArticlesMock.mockReset();
    searchTweetsMock.mockReset();
    getSupabaseClientMock.mockReset();

    supabaseClientMock = { from: vi.fn() };
    getSupabaseClientMock.mockReturnValue(supabaseClientMock);

    service = await import('../src/server/services/marketInsightsService');
  });

  it('returns cached hot topics when cache available', async () => {
    cacheMocks.cacheGetZSet.mockResolvedValue([
      {
        score: 0.62,
        value: {
          id: 'topic-1',
          title: 'Hot market',
          tags: ['crypto'],
          heat: 0.62,
          template: { title: 'Hot market', summary: 'Summary', referenceUrl: '' },
        },
      },
    ]);

    const topics = await service.listHotTopics({ tag: 'crypto', limit: 5 });

    expect(cacheMocks.cacheGetZSet).toHaveBeenCalled();
    expect(cacheMocks.cacheSetZSet).not.toHaveBeenCalled();
    expect(topics).toHaveLength(1);
    expect(topics[0].id).toBe('topic-1');
    expect(topics[0].heat).toBeCloseTo(0.62, 2);
  });

  it('computes hot topics from database when cache missing', async () => {
    cacheMocks.cacheGetZSet.mockResolvedValue(null);
    cacheMocks.cacheSetZSet.mockResolvedValue(undefined);

    const predictions = [
      {
        id: 'p1',
        title: 'BTC over 100k',
        description: 'Trend',
        admin_notes: JSON.stringify({ tags: ['crypto'], referenceUrl: 'https://example.com/btc' }),
        total_pool: '100000',
        yes_pool: '60000',
        no_pool: '40000',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['crypto'],
        reference_url: 'https://example.com/btc',
      },
      {
        id: 'p2',
        title: 'ETH staking surge',
        description: 'Stake',
        admin_notes: JSON.stringify({ tags: ['crypto'], referenceUrl: 'https://example.com/eth' }),
        total_pool: '50000',
        yes_pool: '25000',
        no_pool: '25000',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['crypto'],
        reference_url: 'https://example.com/eth',
      },
    ];

    const bets = [
      { prediction_id: 'p1', user_id: 'u1', amount: '10000' },
      { prediction_id: 'p1', user_id: 'u2', amount: '5000' },
      { prediction_id: 'p2', user_id: 'u1', amount: '2000' },
    ];

    supabaseClientMock.from.mockImplementation((table: string) => {
      if (table === 'predictions') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: predictions, error: null }),
        } as any;
      }
      if (table === 'bets') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: bets, error: null }),
        } as any;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const topics = await service.listHotTopics({ limit: 2 });

    expect(cacheMocks.cacheSetZSet).toHaveBeenCalled();
    expect(topics).toHaveLength(2);
    expect(topics[0].heat).toBeCloseTo(1, 5);
    expect(topics[1].heat).toBeGreaterThan(0);
  });

  it('returns cached market news when available', async () => {
    cacheMocks.cacheGetHash.mockResolvedValue({
      cached: JSON.stringify({
        id: 'news-1',
        marketId: 'market-1',
        source: 'ESPN',
        sourceType: 'media',
        publishedAt: new Date().toISOString(),
        summary: 'Cached summary',
        url: 'https://espn.com',
        sentiment: 'positive',
      }),
    });

    const news = await service.getMarketNews('market-1');

    expect(cacheMocks.cacheGetHash).toHaveBeenCalled();
    expect(cacheMocks.cacheSetHash).not.toHaveBeenCalled();
    expect(news).toHaveLength(1);
    expect(news[0].summary).toBe('Cached summary');
  });

  it('builds market news from feeds and stores in cache', async () => {
    cacheMocks.cacheGetHash.mockResolvedValue(null);
    cacheMocks.cacheSetHash.mockResolvedValue(undefined);

    const predictionRow = {
      id: 'market-42',
      title: 'Messi comeback odds',
      description: 'Predicting Messi return',
      admin_notes: JSON.stringify({ tags: ['sports'] }),
      tags: ['sports'],
      reference_url: 'https://espn.com/a1',
    } as any;

    supabaseClientMock.from.mockImplementation((table: string) => {
      if (table === 'predictions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: predictionRow, error: null }),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: [predictionRow], error: null }),
        } as any;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const now = Date.now();
    fetchRssArticlesMock.mockImplementation(async (url: string) => {
      if (url.includes('espn')) {
        return [
          { id: 'a1', title: 'Messi set for return', content: 'Lionel Messi is close to comeback', link: 'https://espn.com/a1', publishedAt: new Date(now - 3600_000).toISOString(), source: 'espn.com' },
          { id: 'a2', title: 'Messi set for return', content: 'Lionel Messi is close to comeback', link: 'https://espn.com/a2', publishedAt: new Date(now - 7200_000).toISOString(), source: 'espn.com' },
        ];
      }
      return [];
    });

    searchTweetsMock.mockResolvedValue([
      { id: 'tw1', text: 'Messi comeback hype rises', createdAt: new Date(now - 1800_000).toISOString(), url: 'https://twitter.com/status/tw1' },
    ]);

    summarizeContentMock
      .mockResolvedValueOnce({ summary: 'Messi comeback imminent', sentiment: 'positive' })
      .mockResolvedValueOnce({ summary: 'Messi comeback imminent', sentiment: 'positive' })
      .mockResolvedValueOnce({ summary: 'Fans excited about comeback', sentiment: 'neutral' });

    const news = await service.getMarketNews('market-42');

    expect(fetchRssArticlesMock).toHaveBeenCalled();
    expect(searchTweetsMock).toHaveBeenCalled();
    expect(summarizeContentMock).toHaveBeenCalledTimes(3);
    expect(news).toHaveLength(2);
    expect(cacheMocks.cacheSetHash).toHaveBeenCalled();
    expect(news[0].summary).toBeTruthy();
    expect(['media', 'social']).toContain(news[0].sourceType);
  });
});
