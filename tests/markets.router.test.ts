import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMarketDraft = vi.fn();
const getMarketCreationPermission = vi.fn();
const listMarkets = vi.fn();
const getMarketDetail = vi.fn();
const getMarketSnapshot = vi.fn();
const getMarketOdds = vi.fn();
const getMarketLive = vi.fn();
const placeBet = vi.fn();

vi.mock('../src/server/services/marketService.js', () => ({
  createMarketDraft,
  getMarketCreationPermission,
  listMarkets,
  getMarketDetail,
  getMarketSnapshot,
  getMarketOdds,
  getMarketLive,
  placeBet,
}));

vi.mock('../src/server/services/mockMarketService.js', () => ({
  getCreationPermission: vi.fn(),
  listMarkets: vi.fn(),
  createMarketDraft: vi.fn(),
  getMarketDetail: vi.fn(),
  getMarketSnapshot: vi.fn(),
  getMarketOdds: vi.fn(),
  getMarketLive: vi.fn(),
  placeBet: vi.fn(),
}));

const { marketsRouter } = await import('../src/server/routes/markets');

type ExpressHandler = (req: any, res: any, next: (err?: unknown) => void) => unknown;

function findPostHandler(path: string): ExpressHandler {
  for (const layer of marketsRouter.stack) {
    if (!layer.route) continue;
    if (layer.route.path !== path) continue;
    const postLayer = layer.route.stack.find((stack: any) => stack.method === 'post');
    if (postLayer?.handle) {
      return postLayer.handle as ExpressHandler;
    }
  }
  throw new Error(`Post handler for path ${path} not found`);
}

async function invokePost(body: unknown) {
  const handler = findPostHandler('/');
  const req = {
    body,
    params: {},
    query: {},
  };
  const response = {
    statusCode: 200,
    payload: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };

  await handler(req, response, (error?: unknown) => {
    if (error) {
      throw error;
    }
  });

  return response;
}

const baseMarket = {
  id: 'market-1',
  filter: 'live' as const,
  title: 'Sample market',
  description: 'Sample market',
  status: 'Live odds',
  odds: '1.50x / 1.50x',
  yesOdds: 1.5,
  noOdds: 1.5,
  yesPool: 0,
  noPool: 0,
  volume: '0 TAI',
  pool: 0,
  bets: [],
  endsAt: Date.now() + 3600_000,
  createdAt: Date.now(),
  targetPool: 10_000,
  entities: ['Prediction'],
  creatorStakeTai: 1_000,
  stakeCooldownHours: 72,
  juryCount: 0,
  followers: [],
  jurorRewardTai: 100,
  tags: ['sports'],
  topicTags: ['sports'],
  referenceUrl: 'https://espn.example.com',
  referenceSummary: 'Reference summary',
};

describe('markets router - creation payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_MOCK_DATA = 'false';
  });

  it('accepts tags within whitelist and trims reference URL', async () => {
    createMarketDraft.mockResolvedValue(baseMarket);

    const response = await invokePost({
      title: 'Sports headline',
      closesAt: new Date(Date.now() + 7200_000).toISOString(),
      minStake: 100,
      maxStake: 1000,
      creatorWallet: 'EQ-example-wallet',
      creatorStakeTai: 1200,
      tags: ['Sports', 'entertainment'],
      referenceUrl: '  https://espn.example.com/messi  ',
    });

    expect(response.statusCode).toBe(200);
    expect(createMarketDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['sports', 'entertainment'],
        referenceUrl: 'https://espn.example.com/messi',
      }),
    );
    expect(response.payload.tags).toEqual(['sports']);
  });

  it('rejects tags outside whitelist', async () => {
    const response = await invokePost({
      title: 'Invalid tags',
      closesAt: new Date(Date.now() + 7200_000).toISOString(),
      minStake: 100,
      maxStake: 1000,
      creatorWallet: 'EQ-example-wallet',
      creatorStakeTai: 1200,
      tags: ['sports', 'unknown'],
    });

    expect(response.statusCode).toBe(400);
    expect(createMarketDraft).not.toHaveBeenCalled();
  });
});
