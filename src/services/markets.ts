import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

const delay = async <T,>(value: T, ms = 300) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export type MarketFilter = 'all' | 'live' | 'closed' | 'my';

export type MarketBet = {
  id: string;
  user: string;
  amount: number;
  market: string;
  direction: 'long' | 'short';
  timestamp: number;
};

export type MarketCard = {
  id: string;
  filter: 'live' | 'closed';
  isMine?: boolean;
  title: string;
  description: string;
  status: string;
  odds: string;
  volume: string;
  pool: number;
  bets: MarketBet[];
  endsAt: number;
  createdAt: number;
  targetPool: number;
  entities: string[];
  bountyMultiplier: number;
  juryCount: number;
  followers: string[];
  isFavorite?: boolean;
};

export type MarketSortKey = 'latest' | 'hot' | 'closing' | 'bounty' | 'following';

type MarketTemplate = Omit<MarketCard, 'id' | 'pool' | 'volume' | 'createdAt' | 'endsAt' | 'targetPool' | 'bountyMultiplier' | 'juryCount' | 'bets' | 'followers' | 'isFavorite'> & {
  id: string;
  pool: number;
  volume: string;
  endsAt: number;
  targetPool: number;
  bountyMultiplier: number;
  juryCount: number;
  bets: MarketBet[];
  followers?: string[];
};

const MARKET_TEMPLATES: MarketTemplate[] = [
  {
    id: 'btc',
    filter: 'live',
    isMine: true,
    title: 'BTC crosses $80k before Friday',
    description: 'Community sentiment aligns with macro catalysts.',
    status: 'Live odds',
    odds: '1.67x',
    volume: '32,406 TAI',
    pool: 32406,
    endsAt: Date.now() + 45 * 60 * 1000,
    targetPool: 52000,
    entities: ['BTC', 'Derivatives'],
    bountyMultiplier: 1.8,
    juryCount: 3,
    bets: [
      { id: 'btc-1', user: 'pBlue', amount: 8500, market: 'btc', direction: 'long', timestamp: 1740200000 },
      { id: 'btc-2', user: 'Validator Yun', amount: 4200, market: 'btc', direction: 'short', timestamp: 1740198000 },
      { id: 'btc-3', user: 'Amber', amount: 12000, market: 'btc', direction: 'long', timestamp: 1740196000 },
    ],
    followers: ['current_user', 'ecosystem_dao'],
  },
  {
    id: 'eth',
    filter: 'live',
    title: 'ETH staking APY drops under 3%',
    description: 'Validators react to upcoming network upgrades.',
    status: 'Live odds',
    odds: '2.45x',
    volume: '12,887 TAI',
    pool: 12887,
    endsAt: Date.now() + 22 * 60 * 1000,
    targetPool: 36000,
    entities: ['ETH', 'Staking'],
    bountyMultiplier: 2.4,
    juryCount: 5,
    bets: [
      { id: 'eth-1', user: 'Validator Yun', amount: 800, market: 'eth', direction: 'long', timestamp: 1740195000 },
      { id: 'eth-2', user: 'Amber', amount: 4200, market: 'eth', direction: 'long', timestamp: 1740193000 },
      { id: 'eth-3', user: 'pBlue', amount: 3500, market: 'eth', direction: 'short', timestamp: 1740192000 },
    ],
    followers: ['ecosystem_dao'],
  },
  {
    id: 'ton',
    filter: 'closed',
    title: 'TON TVL hits all-time high',
    description: 'Layer-1 incentives draw whales back to TON.',
    status: 'Settled odds',
    odds: '9.30x',
    volume: '5,204 TAI',
    pool: 5204,
    endsAt: Date.now() - 15 * 60 * 1000,
    targetPool: 10000,
    entities: ['TON', 'TVL'],
    bountyMultiplier: 3.1,
    juryCount: 2,
    bets: [
      { id: 'ton-1', user: 'DeepBlue', amount: 2100, market: 'ton', direction: 'long', timestamp: 1740189000 },
      { id: 'ton-2', user: 'Navigator', amount: 600, market: 'ton', direction: 'short', timestamp: 1740184000 },
      { id: 'ton-3', user: 'Whale C', amount: 1500, market: 'ton', direction: 'long', timestamp: 1740181000 },
    ],
    followers: ['archive_keeper'],
  },
  {
    id: 'sol',
    filter: 'live',
    title: 'SOL flips BNB in market cap before Q4',
    description: 'Bridge flows and meme season fuel renewed momentum.',
    status: 'Live odds',
    odds: '1.92x',
    volume: '18,204 TAI',
    pool: 18204,
    endsAt: Date.now() + 70 * 60 * 1000,
    targetPool: 42000,
    entities: ['SOL', 'Layer1'],
    bountyMultiplier: 2.1,
    juryCount: 4,
    bets: [
      { id: 'sol-1', user: 'Validator Yun', amount: 2600, market: 'sol', direction: 'long', timestamp: 1740191000 },
      { id: 'sol-2', user: 'Amber', amount: 3300, market: 'sol', direction: 'long', timestamp: 1740189000 },
      { id: 'sol-3', user: 'Whale C', amount: 5400, market: 'sol', direction: 'short', timestamp: 1740187000 },
    ],
    followers: ['current_user', 'validator_hub'],
  },
  {
    id: 'macro-cpi',
    filter: 'live',
    title: 'US CPI prints below 2.5% before year end',
    description: 'Macro desks expect aggressive disinflation amid supply recovery.',
    status: 'Live odds',
    odds: '2.15x',
    volume: '9,884 TAI',
    pool: 9884,
    endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    targetPool: 25000,
    entities: ['CPI', 'Macro'],
    bountyMultiplier: 2.6,
    juryCount: 3,
    bets: [
      { id: 'cpi-1', user: 'Macro Owl', amount: 1500, market: 'macro-cpi', direction: 'long', timestamp: 1740179000 },
      { id: 'cpi-2', user: 'Amber', amount: 900, market: 'macro-cpi', direction: 'short', timestamp: 1740175000 },
    ],
    followers: ['macro_observer'],
  },
  {
    id: 'sports-uefa',
    filter: 'live',
    title: 'Real Madrid wins UEFA final in regular time',
    description: 'Fan sentiment and odds favor the defending champions.',
    status: 'Live odds',
    odds: '1.55x',
    volume: '7,204 TAI',
    pool: 7204,
    endsAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
    targetPool: 18000,
    entities: ['UEFA', 'Madrid'],
    bountyMultiplier: 1.9,
    juryCount: 2,
    bets: [
      { id: 'uefa-1', user: 'FanBoy', amount: 2100, market: 'sports-uefa', direction: 'long', timestamp: 1740182000 },
      { id: 'uefa-2', user: 'NeutralBot', amount: 1600, market: 'sports-uefa', direction: 'short', timestamp: 1740180000 },
    ],
    followers: ['current_user'],
  },
];

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

const VARIANTS_PER_TEMPLATE = 4;
const now = Date.now();

const MARKET_LIST: MarketCard[] = MARKET_TEMPLATES.flatMap((template, templateIndex) =>
  Array.from({ length: VARIANTS_PER_TEMPLATE }, (_, variantIndex) => {
    const globalIndex = templateIndex * VARIANTS_PER_TEMPLATE + variantIndex;
    const isLive = template.filter === 'live';
    const pool = Math.max(2600, template.pool + variantIndex * 2100 + templateIndex * 780);
    const targetPool = Math.max(template.targetPool + variantIndex * 3500, pool + 6000);
    const createdAt = now - globalIndex * 45 * 60 * 1000;
    const endsAt = isLive
      ? now + (globalIndex % 6 === 0 ? 12 : (globalIndex % 6) * 15 + 12) * 60 * 1000
      : now - (globalIndex + 3) * 30 * 60 * 1000;
    const bountyMultiplier = Number((template.bountyMultiplier + variantIndex * 0.12).toFixed(2));
    const juryCount = template.juryCount + variantIndex;
    const followers = template.followers ?? [];
    const id = variantIndex === 0 ? template.id : `${template.id}-${variantIndex}`;

    return {
      ...template,
      id,
      title: variantIndex === 0 ? template.title : `${template.title} · 第 ${variantIndex + 1} 轮`,
      pool,
      volume: `${formatNumber(pool * 1.42)} TAI`,
      targetPool,
      createdAt,
      endsAt,
      bountyMultiplier,
      juryCount,
      followers: variantIndex === 0 ? followers : followers.slice(0, Math.max(1, followers.length - 1)),
      bets: template.bets.map((bet, betIndex) => ({
        ...bet,
        id: `${bet.id}-${variantIndex}`,
        amount: bet.amount + variantIndex * 220 + betIndex * 35,
        market: id,
        timestamp: bet.timestamp + variantIndex * 480,
      })),
    } satisfies MarketCard;
  }),
);

const MARKET_DETAIL: Record<string, MarketCard & { liquidity: string }> = Object.fromEntries(
  MARKET_LIST.map((market) => [
    market.id,
    {
      ...market,
      liquidity: `${formatNumber(market.pool * 0.52)} TAI`,
    },
  ]),
);

const annotateMarket = (market: MarketCard, userId = 'current_user'): MarketCard => ({
  ...market,
  isFavorite: market.followers.includes(userId),
});

const annotateMarkets = (markets: MarketCard[], userId = 'current_user') => markets.map((market) => annotateMarket(market, userId));

const sortByLatest = (markets: MarketCard[]) => [...markets].sort((a, b) => b.createdAt - a.createdAt);

const sortByHot = (markets: MarketCard[]) =>
  [...markets].sort((a, b) => {
    const score = (market: MarketCard) => market.pool * 0.7 + market.bets.length * 0.3;
    return score(b) - score(a);
  });

const sortByClosing = (markets: MarketCard[]) =>
  [...markets]
    .filter((market) => market.endsAt > Date.now())
    .sort((a, b) => a.endsAt - b.endsAt);

const sortByBounty = (markets: MarketCard[]) => [...markets].sort((a, b) => b.pool - a.pool);

const sortByFollowing = (markets: MarketCard[], userId: string) =>
  [...markets].filter((market) => market.followers.includes(userId));

const paginate = (markets: MarketCard[], cursor: string | undefined, limit: number) => {
  const startIndex = cursor ? markets.findIndex((market) => market.id === cursor) + 1 : 0;
  const slice = markets.slice(startIndex, startIndex + limit);
  const nextCursor = startIndex + limit < markets.length ? markets[startIndex + limit - 1].id : undefined;
  return { items: slice, nextCursor };
};

export const getDaoPoolTotal = () => MARKET_LIST.reduce((sum, market) => sum + market.pool, 0);

export type MarketFeedRequest = {
  sort: MarketSortKey;
  cursor?: string;
  limit?: number;
  userId?: string;
};

export type MarketFeedResponse = {
  items: MarketCard[];
  nextCursor?: string;
};

export const loadMarketFeed = async ({ sort, cursor, limit = 20, userId = 'current_user' }: MarketFeedRequest): Promise<MarketFeedResponse> => {
  const annotated = annotateMarkets(MARKET_LIST, userId);

  const sorted = (() => {
    switch (sort) {
      case 'latest':
        return sortByLatest(annotated);
      case 'hot':
        return sortByHot(annotated);
      case 'closing':
        return sortByClosing(annotated);
      case 'bounty':
        return sortByBounty(annotated);
      case 'following':
        return sortByLatest(sortByFollowing(annotated, userId));
      default:
        return annotated;
    }
  })();

  const { items, nextCursor } = paginate(sorted, cursor, limit);
  return delay({ items, nextCursor });
};

const queryKeys = {
  markets: (filter: MarketFilter) => ['markets', filter] as const,
  marketDetail: (id: string) => ['markets', 'detail', id] as const,
};

const fetchMarkets = async (filter: MarketFilter, userId = 'current_user') => {
  let result: MarketCard[];
  if (filter === 'all') {
    result = MARKET_LIST;
  } else if (filter === 'my') {
    result = MARKET_LIST.filter((market) => market.isMine);
  } else {
    result = MARKET_LIST.filter((market) => market.filter === filter);
  }
  return delay(annotateMarkets(result, userId));
};

const fetchMarketDetail = async (id: string, userId = 'current_user') => {
  const base = MARKET_DETAIL[id] ?? { ...MARKET_LIST[0], id, liquidity: `${formatNumber(MARKET_LIST[0].pool * 0.52)} TAI` };
  const annotated = annotateMarket(base, userId);
  return delay({ ...annotated, liquidity: base.liquidity });
};

export type MarketSnapshot = {
  id: string;
  pool: number;
  participants: number;
  endTime: number;
  juryCount: number;
  targetPool: number;
};

export type BetModalSnapshot = {
  marketId: string;
  marketTitle: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  currency: string;
};

export const loadMarkets = (filter: MarketFilter = 'all', userId = 'current_user') => fetchMarkets(filter, userId);

export const loadMarketDetail = (id: string, userId = 'current_user') => fetchMarketDetail(id, userId);

export const loadMarketSnapshot = async (id: string): Promise<MarketSnapshot> => {
  const market = await fetchMarketDetail(id);
  return {
    id: market.id,
    pool: market.pool,
    participants: market.bets.length,
    endTime: market.endsAt,
    juryCount: market.juryCount,
    targetPool: market.targetPool,
  };
};

export const loadBetModalSnapshot = async (id: string): Promise<BetModalSnapshot> => {
  const market = await fetchMarketDetail(id);
  const suggested = Math.max(25, Math.round(market.pool * 0.05));
  return {
    marketId: market.id,
    marketTitle: market.title,
    amount: suggested,
    minAmount: 10,
    maxAmount: market.targetPool,
    currency: 'TAI',
  };
};

export const useMarketsQuery = (filter: MarketFilter = 'all'): UseQueryResult<MarketCard[]> =>
  useQuery({
    queryKey: queryKeys.markets(filter),
    queryFn: () => fetchMarkets(filter),
  });

export const useMarketDetailQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.marketDetail(id),
    queryFn: async () => fetchMarketDetail(id),
    enabled: Boolean(id),
  });

export const usePlaceBetMutation = () => {
  const mutationFn = useCallback(async () => delay({ success: true }), []);
  return useMutation({ mutationFn });
};
