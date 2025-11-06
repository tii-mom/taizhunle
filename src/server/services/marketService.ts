import { supabase } from './supabaseClient.js';
import { distributeFees, sendToPools } from './feeDistributor.js';
import { ensureUserByWallet, incrementUserStats } from './userService.js';
import { notifyAdmins, notifyChannel } from './telegramService.js';
import { canCreateMarket, getCreateInterval, getCreationStakeRequirement } from '../../utils/dao.js';
import { getOddsConfig, type MarketOddsConfig } from '../config/oddsConfig.js';
import { computeOdds, computeImpactAdjustedStake } from '../utils/odds.js';
import { emitOddsUpdate } from '../events/oddsEmitter.js';
import { recordOddsSequence } from './oddsSequenceService.js';
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
  side: 'yes' | 'no';
  odds: number;
  potentialPayout: number;
  walletAddress?: string | null;
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
  creatorStakeTai: number;
  stakeCooldownHours: number;
  juryCount: number;
  followers: string[];
  isFavorite?: boolean;
  jurorRewardTai: number;
  topicTags?: string[];
  tags?: string[];
  referenceUrl?: string | null;
  referenceSummary?: string | null;
};

export type MarketListResponse = {
  items: MarketCard[];
  nextCursor?: string;
};

export type MarketDetailResponse = MarketCard & {
  liquidity: string;
  participants: number;
};

export type MarketOddsMeta = {
  minOdds: number;
  maxOdds: number;
  defaultOdds: number;
  minPoolRatio: number;
  minAbsolutePool: number;
  sideCapRatio: number;
  otherFloorRatio: number;
  impactFeeCoefficient: number;
  impactMinPool: number;
  impactMaxMultiplier: number;
  sseFallbackMs: number;
};

export type MarketOddsResponse = {
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  fluctuation: number;
  meta: MarketOddsMeta;
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

export type CreateMarketPayload = {
  title: string;
  closesAt: string;
  minStake: number;
  maxStake: number;
  creatorWallet: string;
  creatorStakeTai: number;
  tags?: string[];
  topicTags?: string[];
  referenceUrl?: string | null;
  referenceSummary?: string | null;
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
  const odds = toNumber(row.odds);
  const potentialPayout = toNumber(row.potential_payout);
  return {
    id: row.id,
    user: username || shortenWallet(wallet),
    amount: toNumber(row.amount),
    market: row.prediction_id,
    direction: row.side === 'yes' ? 'long' : 'short',
    side: row.side,
    odds,
    potentialPayout,
    walletAddress: wallet ?? undefined,
    timestamp: new Date(row.created_at).getTime(),
  };
}

type StakeRangeNotes = {
  minStake?: number;
  maxStake?: number;
  jurorRewardTai?: number;
  creatorStakeTai?: number;
  stakeCooldownHours?: number;
};

function parseStakeRange(notes: string | null): StakeRangeNotes | null {
  const parsed = parseAdminNotes(notes);
  if (!parsed) {
    return null;
  }

  const range: StakeRangeNotes = {};
  const numericFields: (keyof StakeRangeNotes)[] = ['minStake', 'maxStake', 'jurorRewardTai', 'creatorStakeTai', 'stakeCooldownHours'];
  for (const field of numericFields) {
    if (parsed[field] !== undefined) {
      const value = Number(parsed[field]);
      if (Number.isFinite(value)) {
        range[field] = value;
      }
    }
  }

  return Object.keys(range).length > 0 ? range : null;
}

function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function loadLastCreationTimestamp(userId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from('predictions')
    .select('created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Failed to query last market creation time:', error.message);
    return null;
  }

  return data?.created_at ? new Date(data.created_at) : null;
}

function parseAdminNotes(notes: string | null): Record<string, unknown> | null {
  if (!notes) {
    return null;
  }

  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore malformed admin notes
  }
  return null;
}

function mapPrediction(row: PredictionRow, bets: MarketBet[] = [], oddsConfig: MarketOddsConfig): MarketCard {
  const yesPool = toNumber(row.yes_pool);
  const noPool = toNumber(row.no_pool);
  const totalPool = toNumber(row.total_pool) || yesPool + noPool;
  const basePool = toNumber(row.base_pool);
  const yesOdds = computeOdds({ totalPool, sidePool: yesPool, config: oddsConfig });
  const noOdds = computeOdds({ totalPool, sidePool: noPool, config: oddsConfig });
  const filter = LIVE_STATUSES.has(row.status) ? 'live' : 'closed';
  const stakeRange = parseStakeRange(row.admin_notes);
  const adminNotes = parseAdminNotes(row.admin_notes);
  const targetPool = stakeRange?.maxStake
    ? Math.max(stakeRange.maxStake, totalPool, basePool)
    : basePool || totalPool;
  const creatorStakeTai = stakeRange?.creatorStakeTai ?? Math.max(1_000, toNumber(row.creator_fee));
  const stakeCooldownHours = stakeRange?.stakeCooldownHours ?? 72;
  const jurorRewardTai = Math.max(0, Math.round(totalPool * 0.01));
  const dbTags = Array.isArray(row.tags)
    ? row.tags.map((tag) => String(tag)).filter(Boolean)
    : [];
  const notesTags = Array.isArray(adminNotes?.tags)
    ? (adminNotes?.tags as unknown[]).map((tag) => String(tag)).filter(Boolean)
    : [];
  const tags = dbTags.length > 0 ? dbTags : notesTags;
  const referenceUrl = typeof row.reference_url === 'string' && row.reference_url.trim().length > 0
    ? row.reference_url
    : (typeof adminNotes?.referenceUrl === 'string' ? String(adminNotes.referenceUrl) : null);
  const referenceSummary = typeof adminNotes?.referenceSummary === 'string' ? String(adminNotes.referenceSummary) : null;

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
    targetPool,
    entities: guessEntities(row),
    creatorStakeTai,
    stakeCooldownHours,
    juryCount: Math.max(0, Math.round(toNumber(row.platform_fee))),
    followers: [],
    jurorRewardTai,
    topicTags: tags,
    tags,
    referenceUrl,
    referenceSummary,
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
  oddsConfig: MarketOddsConfig,
): MarketCard[] {
  return predictions.map((prediction) =>
    mapPrediction(prediction, betsByPrediction.get(prediction.id) ?? [], oddsConfig),
  );
}

async function fetchBetsForPredictions(predictionIds: string[]): Promise<Map<string, MarketBet[]>> {
  const map = new Map<string, MarketBet[]>();

  if (predictionIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from('bets')
    .select('id, amount, side, odds, potential_payout, created_at, prediction_id, user:users(wallet_address, telegram_username)')
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

  const oddsConfig = await getOddsConfig();
  const betsByPrediction = await fetchBetsForPredictions(predictionIds);
  const items = buildMarketMap(predictions, betsByPrediction, oddsConfig);
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

  const oddsConfig = await getOddsConfig();
  const betsByPrediction = await fetchBetsForPredictions([data.id]);
  const marketCard = mapPrediction(data, betsByPrediction.get(data.id) ?? [], oddsConfig);
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

  const oddsConfig = await getOddsConfig();
  const yesOdds = computeOdds({ totalPool, sidePool: yesPool, config: oddsConfig });
  const noOdds = computeOdds({ totalPool, sidePool: noPool, config: oddsConfig });

  return {
    yesOdds,
    noOdds,
    yesPool,
    noPool,
    totalPool,
    fluctuation: 0,
    meta: {
      minOdds: oddsConfig.minOdds,
      maxOdds: oddsConfig.maxOdds,
      defaultOdds: oddsConfig.defaultOdds,
      minPoolRatio: oddsConfig.minPoolRatio,
      minAbsolutePool: oddsConfig.minAbsolutePool,
      sideCapRatio: oddsConfig.sideCapRatio,
      otherFloorRatio: oddsConfig.otherFloorRatio,
      impactFeeCoefficient: oddsConfig.impactFeeCoefficient,
      impactMinPool: oddsConfig.impactMinPool,
      impactMaxMultiplier: oddsConfig.impactMaxMultiplier,
      sseFallbackMs: oddsConfig.sseRefetchFallbackMs,
    },
  } satisfies MarketOddsResponse;
}

export async function getMarketLive(id: string): Promise<MarketLiveResponse> {
  const { data, error } = await supabase
    .from('bets')
    .select('id, amount, side, odds, potential_payout, created_at, prediction_id, referrer_reward, user:users(wallet_address, telegram_username)')
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

export async function createMarketDraft(payload: CreateMarketPayload): Promise<MarketDetailResponse> {
  const closesAt = new Date(payload.closesAt);
  if (Number.isNaN(closesAt.getTime())) {
    throw new Error('Invalid closing time');
  }

  const requiredStake = Math.max(1_000, Math.round(Number(payload.creatorStakeTai)));
  if (!Number.isFinite(requiredStake)) {
    throw new Error('Invalid creation stake.');
  }

  const user = await ensureUserByWallet(payload.creatorWallet, {});
  const userPoints = Number(user.dao_points ?? 0);
  const isJuror = Boolean(user.is_juror);

  const cachedLastCreate = parseTimestamp(user.last_market_created_at);
  const lastCreate = cachedLastCreate ?? (await loadLastCreationTimestamp(user.id));
  const creationWindow = canCreateMarket(lastCreate, userPoints, isJuror);

  if (!creationWindow.canCreate) {
    const waitHours = Math.max(1, Math.ceil(creationWindow.hoursRemaining));
    const nextTime = creationWindow.nextAvailableTime
      ? ` (≈ ${creationWindow.nextAvailableTime.toISOString()})`
      : '';
    throw new Error(`Creation cooldown active. Next slot in ~${waitHours}h${nextTime}`);
  }

  const { stake: stakeRequirement, cooldownHours: stakeCooldownHours, maxStake } = getCreationStakeRequirement(userPoints);
  if (requiredStake < stakeRequirement) {
    throw new Error(`Stake must be at least ${stakeRequirement.toLocaleString()} TAI for your level.`);
  }
  if (requiredStake > maxStake) {
    throw new Error(`Stake cannot exceed ${maxStake.toLocaleString()} TAI.`);
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const basePool = Math.max(requiredStake, Number(payload.minStake) || 0);
  const targetPool = Math.max(basePool, Number(payload.maxStake) || 0, requiredStake);
  const intervalHours = getCreateInterval(userPoints, isJuror);
  const tags = Array.isArray(payload.tags) && payload.tags.length > 0
    ? payload.tags
    : (Array.isArray(payload.topicTags) ? payload.topicTags : []);

  const insertPayload = {
    title: payload.title,
    description: payload.title,
    creator_id: user.id,
    end_time: closesAt.toISOString(),
    status: 'active',
    base_pool: basePool,
    total_pool: 0,
    yes_pool: 0,
    no_pool: 0,
    total_fees: 0,
    creator_fee: requiredStake,
    platform_fee: 0,
    juror_reward_tai: 0,
    tags,
    reference_url: payload.referenceUrl ?? null,
    admin_notes: JSON.stringify({
      minStake: basePool,
      maxStake: targetPool,
      creatorStakeTai: requiredStake,
      stakeCooldownHours,
      intervalHours,
      referenceUrl: payload.referenceUrl ?? null,
      referenceSummary: payload.referenceSummary ?? null,
      tags: tags.length > 0 ? tags : null,
    }),
  } satisfies Partial<PredictionRow>;

  const { data, error } = await supabase
    .from('predictions')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create prediction: ${error?.message ?? 'unknown error'}`);
  }

  const totalCreated = toNumber(user.total_markets_created) + 1;

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      last_market_created_at: nowIso,
      total_markets_created: totalCreated,
    })
    .eq('id', user.id);

  if (userUpdateError) {
    console.warn('Failed to update creator stats:', userUpdateError.message);
  }

  const oddsConfig = await getOddsConfig();
  const marketCard = mapPrediction(data, [], oddsConfig);
  const enrichedMarketCard: MarketDetailResponse = {
    ...marketCard,
    targetPool: Math.max(marketCard.targetPool, targetPool),
    liquidity: '0 TAI',
    participants: 0,
  };

  await notifyAdmins(
    `🆕 *新预测创建*

• 题目: ${payload.title}
• 创建者: ${user.wallet_address}
• 封盘: ${closesAt.toISOString()}
• 赌注范围: ${basePool} ~ ${targetPool} TAI
• 创建质押: ${requiredStake.toLocaleString()} TAI`,
  );

  await notifyChannel(
    `🆕 新预测上线: *${payload.title}*
封盘时间: ${closesAt.toLocaleString()}`,
  );

  return enrichedMarketCard;
}

export type MarketCreationPermission = {
  walletAddress: string;
  canCreate: boolean;
  points: number;
  isJuror: boolean;
  intervalHours: number;
  hoursRemaining: number;
  nextAvailableTime: string | null;
  lastCreatedAt: string | null;
  requiredStakeTai: number;
  stakeCooldownHours: number;
  maxStakeTai: number;
};

export async function getMarketCreationPermission(walletAddress: string): Promise<MarketCreationPermission> {
  const trimmed = walletAddress.trim();
  if (!trimmed) {
    throw new Error('Wallet address is required');
  }

  const user = await ensureUserByWallet(trimmed, {});
  const userPoints = Number(user.dao_points ?? 0);
  const isJuror = Boolean(user.is_juror);
  const cachedLastCreate = parseTimestamp(user.last_market_created_at);
  const lastCreate = cachedLastCreate ?? (await loadLastCreationTimestamp(user.id));
  const window = canCreateMarket(lastCreate, userPoints, isJuror);

  const { stake: requiredStakeTai, cooldownHours: stakeCooldownHours, maxStake } = getCreationStakeRequirement(userPoints);

  return {
    walletAddress: trimmed,
    canCreate: window.canCreate,
    points: userPoints,
    isJuror,
    intervalHours: window.intervalHours,
    hoursRemaining: window.hoursRemaining,
    nextAvailableTime: window.nextAvailableTime ? window.nextAvailableTime.toISOString() : null,
    lastCreatedAt: lastCreate ? lastCreate.toISOString() : null,
    requiredStakeTai,
    stakeCooldownHours,
    maxStakeTai: maxStake,
  } satisfies MarketCreationPermission;
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

export async function placeBet(payload: PlaceBetPayload): Promise<MarketDetailResponse> {
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

  const oddsConfig = await getOddsConfig();

  const yesPool = toNumber(prediction.yes_pool);
  const noPool = toNumber(prediction.no_pool);
  const totalPool = toNumber(prediction.total_pool) || yesPool + noPool;

  const feeRate = Number(process.env.PREDICTION_FEE_RATE ?? '0.05');
  const platformFeeAmount = Number((amount * feeRate).toFixed(2));
  const stakeAfterPlatformFee = Math.max(0, Number((amount - platformFeeAmount).toFixed(2)));

  const poolBefore = payload.side === 'yes' ? yesPool : noPool;
  const impact = computeImpactAdjustedStake(stakeAfterPlatformFee, poolBefore, oddsConfig);
  const impactFeeAmount = impact.impactFee;
  const poolContribution = impact.effectiveStake;
  const totalFeeAmount = Number((platformFeeAmount + impactFeeAmount).toFixed(2));
  const netAmount = Number(poolContribution.toFixed(2));

  if (netAmount <= 0) {
    throw new Error('Bet amount is fully consumed by fees or impact.');
  }

  const newYesPool = Number((payload.side === 'yes' ? yesPool + poolContribution : yesPool).toFixed(2));
  const newNoPool = Number((payload.side === 'no' ? noPool + poolContribution : noPool).toFixed(2));
  const newTotalPool = Number((totalPool + poolContribution).toFixed(2));

  const oddsInput = payload.side === 'yes'
    ? { totalPool: newTotalPool, sidePool: newYesPool, config: oddsConfig }
    : { totalPool: newTotalPool, sidePool: newNoPool, config: oddsConfig };
  const odds = computeOdds(oddsInput);
  const potentialPayout = Number((netAmount * odds).toFixed(2));

  const { data: insertedBet, error: insertError } = await supabase
    .from('bets')
    .insert({
      prediction_id: payload.marketId,
      user_id: user.id,
      side: payload.side,
      amount,
      odds,
      potential_payout: potentialPayout,
      fee_amount: totalFeeAmount,
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
      total_fees: Number((toNumber(prediction.total_fees) + totalFeeAmount).toFixed(2)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.marketId);

  if (updatePredictionError) {
    throw new Error(`Failed to update market pools: ${updatePredictionError.message}`);
  }

  if (totalFeeAmount > 0) {
    const feeMap = distributeFees(totalFeeAmount);
    try {
      await sendToPools(feeMap, payload.marketId, prediction.creator_id ?? undefined, undefined, referrerId);
    } catch (error) {
      console.error('Failed to distribute DAO fees:', error);
    }
  }

  await incrementUserStats(user.id, amount);

  const yesOddsSnapshot = computeOdds({ totalPool: newTotalPool, sidePool: newYesPool, config: oddsConfig });
  const noOddsSnapshot = computeOdds({ totalPool: newTotalPool, sidePool: newNoPool, config: oddsConfig });

  const sequenceRow = await recordOddsSequence({
    marketId: payload.marketId,
    yesOdds: yesOddsSnapshot,
    noOdds: noOddsSnapshot,
    yesPool: newYesPool,
    noPool: newNoPool,
    totalPool: newTotalPool,
  });

  const sequence = sequenceRow?.id ?? Date.now();
  const timestamp = sequenceRow ? new Date(sequenceRow.created_at).getTime() : Date.now();

  emitOddsUpdate({
    sequence,
    marketId: payload.marketId,
    yesOdds: yesOddsSnapshot,
    noOdds: noOddsSnapshot,
    yesPool: newYesPool,
    noPool: newNoPool,
    totalPool: newTotalPool,
    timestamp,
    side: payload.side,
    amount,
    netContribution: netAmount,
    impactFee: impactFeeAmount,
    impactMultiplier: impact.impactMultiplier,
    feeAmount: totalFeeAmount,
  });

  const formattedAmount = formatNumber(amount);
  const message = `🎯 *新投注*\n\n• 市场: ${prediction.title}\n• 金额: *${formattedAmount} TAI*\n• 方向: *${payload.side === 'yes' ? 'Yes' : 'No'}*`;

  await Promise.all([
    notifyAdmins(message),
    notifyChannel(message),
  ]);

  return getMarketDetail(payload.marketId);
}
