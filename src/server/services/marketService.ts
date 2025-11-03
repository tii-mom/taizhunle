import { supabase } from './supabaseClient.js';
import { distributeFees, sendToPools } from './feeDistributor.js';
import { ensureUserByWallet, incrementUserStats } from './userService.js';
import { notifyAdmins, notifyChannel } from './telegramService.js';
import type { BetRow, PredictionRow } from '../types/database.js';

const LIVE_STATUSES = new Set(['active', 'approved']);

type MarketSortKey = 'latest' | 'hot' | 'closing' | 'bounty' | 'following';
type MarketFilterKey = 'all' | 'live' | 'closed' | 'my';

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
  title: string;
  description: string;
  status: string;
  odds: string;
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
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

export type MarketListResponse = {
  items: MarketCard[];
  nextCursor?: string;
};

export type MarketDetailResponse = MarketCard & {
  liquidity: string;
  participants: number;
};

export type MarketOddsResponse = {
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  fluctuation: number;
};

export type MarketLiveResponse = {
  inviteRewards: number;
  maxSingleBet: number;
  maxBetUser: string;
  uniqueBettors: number;
  recentBets: MarketBet[];
};

type ListParams = {
  sort?: string;
  filter?: string;
  cursor?: string;
  limit?: string;
};

type EnsureUserExtras = {
  telegramId?: number;
  telegramUsername?: string;
};

type PlaceBetPayload = {
  marketId: string;
  walletAddress: string;
  side: 'yes' | 'no';
  amount: number;
  note?: string;
  referrerWallet?: string;
  extras?: EnsureUserExtras;
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function computeOdds(totalPool: number, pool: number): number {
  if (totalPool <= 0 && pool <= 0) {
    return 1.5;
  }

  const safePool = pool > 0 ? pool : Math.max(totalPool * 0.25, 1);
  const odds = totalPool > 0 ? totalPool / safePool : 1.5;
  return Number(Math.max(1.01, odds).toFixed(2));
}

function guessEntities(prediction: PredictionRow): string[] {
  const title = prediction.title.toLowerCase();
  const entities = new Set<string>();

  if (title.includes('btc')) entities.add('BTC');
  if (title.includes('eth')) entities.add('ETH');
  if (title.includes('ton')) entities.add('TON');
  if (title.includes('sol')) entities.add('SOL');
  if (title.includes('macro')) entities.add('Macro');
  if (title.includes('sport') || title.includes('uefa')) entities.add('Sports');

  if (entities.size === 0) {
    entities.add('Prediction');
  }

  return Array.from(entities);
}

function shortenWallet(value: string | null | undefined): string {
  if (!value) {
    return 'anon';
  }

  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function mapBet(row: BetRow & { user?: { wallet_address?: string | null; telegram_username?: string | null } }): MarketBet {
  const username = row.user?.telegram_username;
  const wallet = row.user?.wallet_address;
  return {
    id: row.id,
    user: username || shortenWallet(wallet),
    amount: toNumber(row.amount),
    market: row.prediction_id,
    direction: row.side === 'yes' ? 'long' : 'short',
    timestamp: new Date(row.created_at).getTime(),
  };
}

function mapPrediction(row: PredictionRow, bets: MarketBet[] = []): MarketCard {
  const yesPool = toNumber(row.yes_pool);
  const noPool = toNumber(row.no_pool);
  const totalPool = toNumber(row.total_pool) || yesPool + noPool;
  const yesOdds = computeOdds(totalPool, yesPool);
  const noOdds = computeOdds(totalPool, noPool);
  const filter = LIVE_STATUSES.has(row.status) ? 'live' : 'closed';
  const bountyMultiplier = row.base_pool > 0 ? Number((totalPool / row.base_pool).toFixed(2)) : 1;

  return {
    id: row.id,
    filter,
    title: row.title,
    description: row.description,
    status: filter === 'live' ? 'Live odds' : 'Settled odds',
    odds: `${yesOdds.toFixed(2)}x / ${noOdds.toFixed(2)}x`,
    yesOdds,
    noOdds,
    yesPool,
    noPool,
    volume: `${formatNumber(totalPool)} TAI`,
    pool: totalPool,
    bets,
    endsAt: new Date(row.end_time).getTime(),
    createdAt: new Date(row.created_at).getTime(),
    targetPool: toNumber(row.base_pool) || totalPool,
    entities: guessEntities(row),
    bountyMultiplier,
    juryCount: Math.max(0, Math.round(toNumber(row.platform_fee))),
    followers: [],
  } satisfies MarketCard;
}

function normaliseSort(sort?: string): MarketSortKey {
  if (sort === 'hot' || sort === 'closing' || sort === 'bounty' || sort === 'following') {
    return sort;
  }
  return 'latest';
}

function normaliseFilter(filter?: string): MarketFilterKey {
  if (filter === 'live' || filter === 'closed' || filter === 'my') {
    return filter;
  }
  return 'all';
}

function buildMarketMap(
  predictions: PredictionRow[],
  betsByPrediction: Map<string, MarketBet[]>,
): MarketCard[] {
  return predictions.map((prediction) => mapPrediction(prediction, betsByPrediction.get(prediction.id) ?? []));
}

async function fetchBetsForPredictions(predictionIds: string[]): Promise<Map<string, MarketBet[]>> {
  const map = new Map<string, MarketBet[]>();

  if (predictionIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from('bets')
    .select('id, amount, side, created_at, prediction_id, user:users(wallet_address, telegram_username)')
    .in('prediction_id', predictionIds)
    .order('created_at', { ascending: false })
    .limit(predictionIds.length * 8);

  if (error) {
    throw new Error(`Failed to fetch bets: ${error.message}`);
  }

  for (const row of data ?? []) {
    const marketBet = mapBet(row as BetRow & { user?: { wallet_address?: string | null; telegram_username?: string | null } });
    const existing = map.get(row.prediction_id) ?? [];
    if (existing.length < 6) {
      existing.push(marketBet);
      map.set(row.prediction_id, existing);
    }
  }

  return map;
}

export async function listMarkets(params: ListParams = {}): Promise<MarketListResponse> {
  const sort = normaliseSort(params.sort);
  const filter = normaliseFilter(params.filter);
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const cursor = params.cursor ? new Date(Number(params.cursor) || Date.parse(params.cursor)) : null;

  let query = supabase
    .from('predictions')
    .select('*');

  if (filter === 'live') {
    query = query.in('status', Array.from(LIVE_STATUSES));
  } else if (filter === 'closed') {
    query = query.not('status', 'in', `(${Array.from(LIVE_STATUSES).join(',')})`);
  }

  if (cursor && !Number.isNaN(cursor.getTime())) {
    if (sort === 'closing') {
      query = query.gt('end_time', cursor.toISOString());
    } else {
      query = query.lt('created_at', cursor.toISOString());
    }
  }

  if (sort === 'hot') {
    query = query.order('total_pool', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'closing') {
    query = query.order('end_time', { ascending: true });
  } else if (sort === 'bounty') {
    query = query.order('total_fees', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.limit(limit + 1);

  if (error) {
    throw new Error(`Failed to load markets: ${error.message}`);
  }

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const predictions = hasMore ? rows.slice(0, limit) : rows;
  const predictionIds = predictions.map((prediction) => prediction.id);

  const betsByPrediction = await fetchBetsForPredictions(predictionIds);
  const items = buildMarketMap(predictions, betsByPrediction);
  const nextCursor = hasMore ? new Date(rows[limit].created_at).getTime().toString() : undefined;

  return { items, nextCursor } satisfies MarketListResponse;
}

export async function getMarketDetail(id: string): Promise<MarketDetailResponse> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load market: ${error.message}`);
  }

  if (!data) {
    throw new Error('Market not found');
  }

  const betsByPrediction = await fetchBetsForPredictions([data.id]);
  const marketCard = mapPrediction(data, betsByPrediction.get(data.id) ?? []);
  const participants = new Set(marketCard.bets.map((bet) => bet.user)).size;
  const liquidity = `${formatNumber(Math.max(marketCard.pool * 0.42, 0))} TAI`;

  return {
    ...marketCard,
    liquidity,
    participants,
  } satisfies MarketDetailResponse;
}

export async function getMarketSnapshot(id: string) {
  const detail = await getMarketDetail(id);
  return {
    id: detail.id,
    title: detail.title,
    pool: detail.pool,
    participants: detail.participants,
    endTime: detail.endsAt,
    juryCount: detail.juryCount,
    targetPool: detail.targetPool,
  };
}

export async function getMarketOdds(id: string): Promise<MarketOddsResponse> {
  const { data, error } = await supabase
    .from('predictions')
    .select('yes_pool, no_pool, total_pool')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load odds: ${error.message}`);
  }

  if (!data) {
    throw new Error('Market not found');
  }

  const yesPool = toNumber(data.yes_pool);
  const noPool = toNumber(data.no_pool);
  const totalPool = toNumber(data.total_pool) || yesPool + noPool;

  return {
    yesOdds: computeOdds(totalPool, yesPool),
    noOdds: computeOdds(totalPool, noPool),
    yesPool,
    noPool,
    totalPool,
    fluctuation: 0,
  } satisfies MarketOddsResponse;
}

export async function getMarketLive(id: string): Promise<MarketLiveResponse> {
  const { data, error } = await supabase
    .from('bets')
    .select('id, amount, side, created_at, prediction_id, referrer_reward, user:users(wallet_address, telegram_username)')
    .eq('prediction_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load live data: ${error.message}`);
  }

  const bets = (data ?? []).map((row) => mapBet(row as BetRow & { user?: { wallet_address?: string | null; telegram_username?: string | null } }));
  const inviteRewards = (data ?? []).reduce((sum, row) => sum + toNumber((row as BetRow).referrer_reward), 0);
  const maxBet = bets.reduce((max, bet) => (bet.amount > max.amount ? bet : max), { amount: 0, user: 'anon' } as { amount: number; user: string });
  const uniqueBettors = new Set(bets.map((bet) => bet.user)).size;

  return {
    inviteRewards,
    maxSingleBet: maxBet.amount,
    maxBetUser: maxBet.user,
    uniqueBettors,
    recentBets: bets,
  } satisfies MarketLiveResponse;
}

async function resolveReferrerId(wallet?: string | null): Promise<string | undefined> {
  if (!wallet) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', wallet.trim())
    .maybeSingle();

  if (error) {
    console.warn('Failed to resolve referrer wallet:', error.message);
    return undefined;
  }

  return data?.id ?? undefined;
}

export async function placeBet(payload: PlaceBetPayload): Promise<void> {
  const amount = Number(payload.amount);

  if (!payload.walletAddress) {
    throw new Error('Wallet address is required');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Bet amount must be greater than zero');
  }

  if (payload.side !== 'yes' && payload.side !== 'no') {
    throw new Error('Invalid bet side');
  }

  const { data: prediction, error: predictionError } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', payload.marketId)
    .maybeSingle();

  if (predictionError) {
    throw new Error(`Failed to load market: ${predictionError.message}`);
  }

  if (!prediction) {
    throw new Error('Market not found');
  }

  if (!LIVE_STATUSES.has(prediction.status)) {
    throw new Error('Market is not accepting bets');
  }

  const user = await ensureUserByWallet(payload.walletAddress, {
    telegramId: payload.extras?.telegramId,
    telegramUsername: payload.extras?.telegramUsername,
  });

  const referrerId = await resolveReferrerId(payload.referrerWallet);

  const yesPool = toNumber(prediction.yes_pool);
  const noPool = toNumber(prediction.no_pool);
  const totalPool = toNumber(prediction.total_pool) || yesPool + noPool;

  const newYesPool = payload.side === 'yes' ? yesPool + amount : yesPool;
  const newNoPool = payload.side === 'no' ? noPool + amount : noPool;
  const newTotalPool = totalPool + amount;

  const odds = payload.side === 'yes' ? computeOdds(newTotalPool, newYesPool) : computeOdds(newTotalPool, newNoPool);
  const potentialPayout = Number((amount * odds).toFixed(2));

  const feeRate = Number(process.env.PREDICTION_FEE_RATE ?? '0.05');
  const feeAmount = Number((amount * feeRate).toFixed(2));
  const netAmount = Number((amount - feeAmount).toFixed(2));

  const { data: insertedBet, error: insertError } = await supabase
    .from('bets')
    .insert({
      prediction_id: payload.marketId,
      user_id: user.id,
      side: payload.side,
      amount,
      odds,
      potential_payout: potentialPayout,
      fee_amount: feeAmount,
      net_amount: netAmount,
      referrer_id: referrerId ?? null,
      status: 'confirmed',
    })
    .select('id')
    .single();

  if (insertError || !insertedBet) {
    throw new Error(`Failed to create bet: ${insertError?.message ?? 'Unknown error'}`);
  }

  const { error: updatePredictionError } = await supabase
    .from('predictions')
    .update({
      yes_pool: newYesPool,
      no_pool: newNoPool,
      total_pool: newTotalPool,
      total_fees: toNumber(prediction.total_fees) + feeAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.marketId);

  if (updatePredictionError) {
    throw new Error(`Failed to update market pools: ${updatePredictionError.message}`);
  }

  if (feeAmount > 0) {
    const feeMap = distributeFees(feeAmount);
    try {
      await sendToPools(feeMap, payload.marketId, prediction.creator_id ?? undefined, undefined, referrerId);
    } catch (error) {
      console.error('Failed to distribute DAO fees:', error);
    }
  }

  await incrementUserStats(user.id, amount);

  const formattedAmount = formatNumber(amount);
  const message = `🎯 *新投注*\n\n• 市场: ${prediction.title}\n• 金额: *${formattedAmount} TAI*\n• 方向: *${payload.side === 'yes' ? 'Yes' : 'No'}*`;

  await Promise.all([
    notifyAdmins(message),
    notifyChannel(message),
  ]);
}
