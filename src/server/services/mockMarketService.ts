/**
 * 模拟市场服务 - 用于开发和离线场景
 */

import type {
  MarketCard,
  MarketCreationPermission,
  MarketDetailResponse,
  MarketLiveResponse,
  MarketListResponse,
  MarketOddsResponse,
} from './marketService.js';

const numberFormatter = new Intl.NumberFormat('en-US');

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
    bountyMultiplier: 1.5,
    juryCount: 12,
    followers: [],
    participants: 156,
    jurorRewardTai: 1000,
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
    bountyMultiplier: 1.2,
    juryCount: 8,
    followers: [],
    participants: 98,
    jurorRewardTai: 1000,
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
    bountyMultiplier: 1.8,
    juryCount: 15,
    followers: [],
    participants: 140,
    jurorRewardTai: 1000,
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
    bountyMultiplier: 1.3,
    juryCount: 10,
    followers: [],
    participants: 76,
    jurorRewardTai: 1000,
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
  return {
    ...market,
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
  market.bountyMultiplier = Number((market.pool / Math.max(market.targetPool || market.pool || 1, 1)).toFixed(2));
  market.participants = (market.participants ?? 0) + 1;

  return snapshotDetail(market);
}

export async function createMarketDraft(payload: {
  title: string;
  closesAt: string;
  minStake: number;
  maxStake: number;
  rewardTai: number;
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
    bountyMultiplier: 1,
    juryCount: 0,
    followers: [],
    participants: 0,
    jurorRewardTai: Math.max(100, Math.round(payload.rewardTai)),
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
    minRewardTai: 100,
    maxRewardTai: 10_000,
    defaultRewardTai: 250,
  } satisfies MarketCreationPermission;
}
