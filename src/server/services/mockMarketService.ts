/**
 * 模拟市场服务 - 用于开发和离线场景
 */

import { DEFAULT_MARKET_ODDS_CONFIG } from '../config/oddsConfig.js';
import type {
  MarketCard,
  MarketCreationPermission,
  MarketDetailResponse,
  MarketLiveResponse,
  MarketListResponse,
  MarketOddsResponse,
} from './marketService.js';

const numberFormatter = new Intl.NumberFormat('en-US');

const NOW = Date.now();

const MOCK_HOT_TOPICS = [
  {
    id: 'topic-btc-halving',
    title: 'BTC 再次逼近 100K？分析师称 ETF 流入创纪录',
    tags: ['crypto', 'macro'],
    heat: 0.92,
    template: {
      title: 'BTC 是否会在 30 天内突破 100,000 美元？',
      summary: 'BTC ETF 当周净流入 12 亿美金，链上活跃地址创近 18 个月新高，多家机构预估将触发新一轮做多。',
      referenceUrl: 'https://www.coindesk.com/markets/2025/01/15/btc-etf-inflows-record/',
    },
  },
  {
    id: 'topic-messi-return',
    title: '梅西年底复出？迈阿密俱乐部官宣亚洲行计划',
    tags: ['sports', 'football'],
    heat: 0.88,
    template: {
      title: '梅西会在年底前重返官方比赛？',
      summary: '迈阿密国际公布 12 月亚洲行，梅西伤情恢复良好并随队训练，博彩公司将其复出概率上调至 68%。',
      referenceUrl: 'https://espn.com/soccer/story/_/id/123456',
    },
  },
  {
    id: 'topic-fed-cut',
    title: '美联储是否会在 Q2 降息？失业率上升引发猜测',
    tags: ['macro', 'politics'],
    heat: 0.84,
    template: {
      title: '美联储会在下个季度宣布降息吗？',
      summary: '最新就业数据出现松动，市场隐含降息概率升至 52%，同时通胀仍高于目标，决议存在变数。',
      referenceUrl: 'https://www.bloomberg.com/news/articles/fed-cut-odds',
    },
  },
];

const MOCK_MARKET_NEWS = [
  {
    id: 'news-btc-1',
    marketId: 'market-1',
    source: 'CoinDesk',
    sourceType: 'media' as const,
    publishedAt: new Date(NOW - 2 * 60 * 60 * 1000).toISOString(),
    summary: 'CoinDesk 报道称 ETF 净流入创两周新高，BlackRock 与 Fidelity 均出现大额申购。',
    url: 'https://www.coindesk.com/latest/btc-etf-flows',
    sentiment: 'positive' as const,
  },
  {
    id: 'news-btc-2',
    marketId: 'market-1',
    source: 'Twitter',
    sourceType: 'social' as const,
    publishedAt: new Date(NOW - 5 * 60 * 60 * 1000).toISOString(),
    summary: '#BTC100K 话题 24 小时提及量上涨 37%，社交情绪指数转为正面。',
    url: 'https://twitter.com/search?q=BTC100K',
    sentiment: 'positive' as const,
  },
  {
    id: 'news-messi-1',
    marketId: 'market-3',
    source: 'ESPN',
    sourceType: 'media' as const,
    publishedAt: new Date(NOW - 90 * 60 * 1000).toISOString(),
    summary: '迈阿密国际发布官方通告，确认 12 月亚洲行将全主力出战，队医表示梅西恢复顺利。',
    url: 'https://www.espn.com/soccer/story/_/id/123457',
    sentiment: 'positive' as const,
  },
  {
    id: 'news-fed-1',
    marketId: 'market-4',
    source: 'Bloomberg',
    sourceType: 'media' as const,
    publishedAt: new Date(NOW - 4 * 60 * 60 * 1000).toISOString(),
    summary: '彭博社最新调查显示，超过半数经济学家认为 Q2 降息一次，部分担忧通胀反弹。',
    url: 'https://www.bloomberg.com/news/articles/fed-poll',
    sentiment: 'neutral' as const,
  },
];

type MockHotTopic = (typeof MOCK_HOT_TOPICS)[number];
type MockMarketNews = (typeof MOCK_MARKET_NEWS)[number];

function formatTai(amount: number): string {
  return `${numberFormatter.format(Math.max(0, Math.round(amount))) } TAI`;
}

function computeOdds(totalPool: number, pool: number): number {
  if (totalPool <= 0 && pool <= 0) {
    return 1.5;
  }

  const safePool = pool > 0 ? pool : Math.max(totalPool * 0.25, 1);
  const odds = totalPool > 0 ? totalPool / safePool : 1.5;
  return Number(Math.max(1.01, odds).toFixed(2));
}

function shortenWallet(wallet: string): string {
  if (!wallet) return 'anon';
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type MockBetPayload = {
  marketId: string;
  amount: number;
  side: 'yes' | 'no';
  walletAddress: string;
  note?: string;
};

// 基础模拟数据
const MOCK_MARKETS: MarketCard[] = [
  {
    id: 'market-1',
    filter: 'live',
    title: 'BTC 价格是否会在 2025 年 12 月前突破 $150,000?',
    description: '预测比特币价格走势',
    status: 'Live odds',
    odds: '2.10x / 1.85x',
    yesOdds: 2.1,
    noOdds: 1.85,
    yesPool: 45000,
    noPool: 55000,
    volume: '100,000 TAI',
    pool: 100000,
    bets: [],
    endsAt: Date.now() + 86400000 * 30,
    createdAt: Date.now() - 86400000 * 7,
    targetPool: 200000,
    entities: ['BTC', 'Crypto'],
    creatorStakeTai: 5_000,
    stakeCooldownHours: 48,
    juryCount: 12,
    followers: [],
    participants: 156,
  },
  {
    id: 'market-2',
    filter: 'live',
    title: 'ETH 2.0 质押量是否会在 Q4 超过 3000 万枚?',
    description: '以太坊质押趋势预测',
    status: 'Live odds',
    odds: '1.75x / 2.25x',
    yesOdds: 1.75,
    noOdds: 2.25,
    yesPool: 60000,
    noPool: 40000,
    volume: '100,000 TAI',
    pool: 100000,
    bets: [],
    endsAt: Date.now() + 86400000 * 60,
    createdAt: Date.now() - 86400000 * 5,
    targetPool: 150000,
    entities: ['ETH', 'Staking'],
    creatorStakeTai: 10_000,
    stakeCooldownHours: 24,
    juryCount: 8,
    followers: [],
    participants: 98,
  },
  {
    id: 'market-3',
    filter: 'live',
    title: 'TON 生态 TVL 是否会在年底前达到 $10B?',
    description: 'TON 生态系统增长预测',
    status: 'Live odds',
    odds: '3.00x / 1.50x',
    yesOdds: 3,
    noOdds: 1.5,
    yesPool: 25000,
    noPool: 75000,
    volume: '100,000 TAI',
    pool: 100000,
    bets: [],
    endsAt: Date.now() + 86400000 * 90,
    createdAt: Date.now() - 86400000 * 3,
    targetPool: 180000,
    entities: ['TON', 'DeFi'],
    creatorStakeTai: 20_000,
    stakeCooldownHours: 6,
    juryCount: 15,
    followers: [],
    participants: 140,
  },
  {
    id: 'market-4',
    filter: 'live',
    title: '美联储是否会在 2025 年降息超过 3 次?',
    description: '宏观经济政策预测',
    status: 'Live odds',
    odds: '1.90x / 2.00x',
    yesOdds: 1.9,
    noOdds: 2,
    yesPool: 52000,
    noPool: 48000,
    volume: '100,000 TAI',
    pool: 100000,
    bets: [],
    endsAt: Date.now() + 86400000 * 120,
    createdAt: Date.now() - 86400000 * 2,
    targetPool: 120000,
    entities: ['Macro', 'Fed'],
    creatorStakeTai: 5_000,
    stakeCooldownHours: 72,
    juryCount: 10,
    followers: [],
    participants: 76,
  },
];

function findMarket(id: string): MarketCard {
  const market = MOCK_MARKETS.find((item) => item.id === id);
  if (!market) {
    throw new Error('Market not found');
  }
  return market;
}

function snapshotDetail(market: MarketCard): MarketDetailResponse {
  const tags = Array.isArray(market.tags) && market.tags.length > 0
    ? market.tags
    : (market.topicTags ?? []);
  return {
    ...market,
    tags,
    topicTags: tags,
    liquidity: formatTai(Math.max(market.pool * 0.42, 0)),
    participants: market.participants ?? market.bets.length,
  } satisfies MarketDetailResponse;
}

export async function listMarkets(): Promise<MarketListResponse> {
  await delay(200);
  return {
    items: MOCK_MARKETS,
    nextCursor: undefined,
  };
}

export async function getMarketDetail(id: string): Promise<MarketDetailResponse> {
  await delay(120);
  return snapshotDetail(findMarket(id));
}

export async function getMarketSnapshot(id: string) {
  const market = await getMarketDetail(id);
  return {
    id: market.id,
    title: market.title,
    pool: market.pool,
    participants: market.participants,
    endTime: market.endsAt,
    juryCount: market.juryCount,
    targetPool: market.targetPool,
  };
}

export async function getMarketOdds(id: string): Promise<MarketOddsResponse> {
  await delay(80);
  const market = findMarket(id);
  return {
    yesOdds: market.yesOdds,
    noOdds: market.noOdds,
    yesPool: market.yesPool,
    noPool: market.noPool,
    totalPool: market.pool,
    fluctuation: 0,
    meta: {
      minOdds: DEFAULT_MARKET_ODDS_CONFIG.minOdds,
      maxOdds: DEFAULT_MARKET_ODDS_CONFIG.maxOdds,
      defaultOdds: DEFAULT_MARKET_ODDS_CONFIG.defaultOdds,
      minPoolRatio: DEFAULT_MARKET_ODDS_CONFIG.minPoolRatio,
      minAbsolutePool: DEFAULT_MARKET_ODDS_CONFIG.minAbsolutePool,
      sideCapRatio: DEFAULT_MARKET_ODDS_CONFIG.sideCapRatio,
      otherFloorRatio: DEFAULT_MARKET_ODDS_CONFIG.otherFloorRatio,
      impactFeeCoefficient: DEFAULT_MARKET_ODDS_CONFIG.impactFeeCoefficient,
      impactMinPool: DEFAULT_MARKET_ODDS_CONFIG.impactMinPool,
      impactMaxMultiplier: DEFAULT_MARKET_ODDS_CONFIG.impactMaxMultiplier,
      sseFallbackMs: DEFAULT_MARKET_ODDS_CONFIG.sseRefetchFallbackMs,
    },
  } satisfies MarketOddsResponse;
}

export async function getMarketLive(id: string): Promise<MarketLiveResponse> {
  await delay(100);
  const market = findMarket(id);
  return {
    inviteRewards: Math.round(market.pool * 0.0125),
    maxSingleBet: Math.max(...market.bets.map((bet) => bet.amount), 0),
    maxBetUser: market.bets[0]?.user ?? 'Amber',
    uniqueBettors: new Set(market.bets.map((bet) => bet.user)).size || market.participants || 0,
    recentBets: market.bets.slice(0, 10),
  } satisfies MarketLiveResponse;
}

export async function placeBet(payload: MockBetPayload): Promise<MarketDetailResponse> {
  await delay(180);
  if (!payload.walletAddress?.trim()) {
    throw new Error('Wallet address is required');
  }
  const market = findMarket(payload.marketId);

  const betId = `mock-bet-${Date.now()}`;
  const odds = payload.side === 'yes' ? market.yesOdds : market.noOdds;
  const potentialPayout = Number((payload.amount * odds).toFixed(2));
  const newBet = {
    id: betId,
    user: shortenWallet(payload.walletAddress),
    amount: payload.amount,
    market: payload.marketId,
    direction: payload.side === 'yes' ? 'long' : 'short',
    side: payload.side,
    odds,
    potentialPayout,
    walletAddress: payload.walletAddress,
    timestamp: Date.now(),
  } as const;

  market.bets = [newBet, ...market.bets].slice(0, 40);

  if (payload.side === 'yes') {
    market.yesPool += payload.amount;
  } else {
    market.noPool += payload.amount;
  }

  market.pool += payload.amount;
  market.volume = formatTai(market.pool);
  market.yesOdds = computeOdds(market.pool, market.yesPool);
  market.noOdds = computeOdds(market.pool, market.noPool);
  market.odds = `${market.yesOdds.toFixed(2)}x / ${market.noOdds.toFixed(2)}x`;
  market.jurorRewardTai = Math.max(100, Math.round(market.pool * 0.01));
  market.participants = (market.participants ?? 0) + 1;

  return snapshotDetail(market);
}

export async function createMarketDraft(payload: {
  title: string;
  closesAt: string;
  minStake: number;
  maxStake: number;
  creatorStakeTai: number;
  tags?: string[];
  topicTags?: string[];
  referenceUrl?: string | null;
  referenceSummary?: string | null;
}) {
  const id = `mock-market-${Date.now()}`;
  const endsAt = new Date(payload.closesAt).getTime();

  const draft: MarketCard = {
    id,
    filter: 'live',
    title: payload.title,
    description: payload.title,
    status: 'Live odds',
    odds: '1.50x / 1.50x',
    yesOdds: 1.5,
    noOdds: 1.5,
    yesPool: 0,
    noPool: 0,
    volume: '0 TAI',
    pool: 0,
    bets: [],
    endsAt,
    createdAt: Date.now(),
    targetPool: payload.maxStake,
    entities: ['Prediction'],
    creatorStakeTai: payload.creatorStakeTai,
    stakeCooldownHours: 72,
    juryCount: 0,
    followers: [],
    participants: 0,
    jurorRewardTai: Math.max(100, Math.round(payload.creatorStakeTai * 0.01)),
    topicTags: payload.tags ?? payload.topicTags ?? [],
    tags: payload.tags ?? payload.topicTags ?? [],
    referenceUrl: payload.referenceUrl ?? null,
    referenceSummary: payload.referenceSummary ?? null,
  };

  MOCK_MARKETS.unshift(draft);
  return snapshotDetail(draft);
}

export async function getCreationPermission(walletAddress: string): Promise<MarketCreationPermission> {
  return {
    walletAddress,
    canCreate: true,
    points: 0,
    isJuror: false,
    intervalHours: 360,
    hoursRemaining: 0,
    nextAvailableTime: null,
    lastCreatedAt: null,
    requiredStakeTai: 1_000,
    stakeCooldownHours: 72,
    maxStakeTai: 20_000,
  } satisfies MarketCreationPermission;
}

export type HotTopicQuery = {
  tag?: string;
  limit?: number;
};

export async function listHotTopics(query: HotTopicQuery = {}): Promise<MockHotTopic[]> {
  const normalizedTag = query.tag?.toLowerCase();
  const limit = Math.min(Math.max(query.limit ?? 10, 1), 20);
  const items = normalizedTag
    ? MOCK_HOT_TOPICS.filter((topic) => topic.tags.some((tag) => tag.toLowerCase() === normalizedTag))
    : MOCK_HOT_TOPICS;
  return items
    .sort((a, b) => b.heat - a.heat)
    .slice(0, limit);
}

export async function getMarketNews(marketId: string): Promise<MockMarketNews[]> {
  return MOCK_MARKET_NEWS.filter((item) => item.marketId === marketId).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
