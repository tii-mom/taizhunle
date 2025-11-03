import { supabase } from './supabaseClient.js';
import { toNumber } from '../utils/number.js';

export type RankingType = 'invite' | 'whale' | 'prophet';

interface AggregatedUser {
  userId: string;
  wallet: string | null;
  username: string | null;
  score: number;
  inviteEarnings?: number;
  predictionEarnings?: number;
  predictions?: number;
  accuracy?: number;
}

async function fetchUserProfiles(userIds: string[]): Promise<Record<string, { username: string | null; wallet: string | null }>> {
  if (userIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, telegram_username, wallet_address')
    .in('id', Array.from(new Set(userIds)));

  if (error) {
    throw new Error(`Failed to load user profiles: ${error.message}`);
  }

  const map: Record<string, { username: string | null; wallet: string | null }> = {};
  for (const entry of data ?? []) {
    map[entry.id] = {
      username: entry.telegram_username,
      wallet: entry.wallet_address,
    };
  }
  return map;
}

function shortenWallet(wallet: string | null | undefined): string {
  if (!wallet) return 'anon';
  return wallet.length > 10 ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : wallet;
}

async function aggregateInviteRanking(): Promise<AggregatedUser[]> {
  const { data, error } = await supabase
    .from('dao_pool')
    .select('user_id, wallet_address, amount')
    .eq('pool_type', 'invite');

  if (error) {
    throw new Error(`Failed to aggregate invite ranking: ${error.message}`);
  }

  const totals = new Map<string, { amount: number; wallet: string | null }>();

  for (const entry of data ?? []) {
    if (!entry.user_id) continue;
    const current = totals.get(entry.user_id) ?? { amount: 0, wallet: entry.wallet_address ?? null };
    current.amount += toNumber(entry.amount);
    if (!current.wallet && entry.wallet_address) {
      current.wallet = entry.wallet_address;
    }
    totals.set(entry.user_id, current);
  }

  const profiles = await fetchUserProfiles(Array.from(totals.keys()));

  return Array.from(totals.entries()).map(([userId, value]) => ({
    userId,
    wallet: value.wallet ?? profiles[userId]?.wallet ?? null,
    username: profiles[userId]?.username ?? null,
    score: value.amount,
    inviteEarnings: value.amount,
  }));
}

async function aggregateWhaleRanking(): Promise<AggregatedUser[]> {
  const { data, error } = await supabase
    .from('whale_rankings')
    .select('wallet_address, amount_tai, rank');

  if (error) {
    throw new Error(`Failed to aggregate whale ranking: ${error.message}`);
  }

  return (data ?? []).map(entry => ({
    userId: entry.wallet_address ?? `whale-${entry.rank ?? 0}`,
    wallet: entry.wallet_address ?? null,
    username: null,
    score: toNumber(entry.amount_tai),
    predictionEarnings: toNumber(entry.amount_tai),
  }));
}

async function aggregateProphetRanking(): Promise<AggregatedUser[]> {
  const { data, error } = await supabase
    .from('bets')
    .select('user_id, status, amount, potential_payout')
    .in('status', ['won', 'lost']);

  if (error) {
    throw new Error(`Failed to aggregate prophet ranking: ${error.message}`);
  }

  const map = new Map<string, { wins: number; total: number; gain: number }>();

  for (const entry of data ?? []) {
    if (!entry.user_id) continue;
    const current = map.get(entry.user_id) ?? { wins: 0, total: 0, gain: 0 };
    current.total += 1;
    if (entry.status === 'won') {
      current.wins += 1;
      current.gain += toNumber(entry.potential_payout) - toNumber(entry.amount);
    } else {
      current.gain -= toNumber(entry.amount);
    }
    map.set(entry.user_id, current);
  }

  const profiles = await fetchUserProfiles(Array.from(map.keys()));

  return Array.from(map.entries()).map(([userId, value]) => {
    const accuracy = value.total > 0 ? Math.round((value.wins / value.total) * 100) : 0;
    return {
      userId,
      wallet: profiles[userId]?.wallet ?? null,
      username: profiles[userId]?.username ?? null,
      score: accuracy,
      predictions: value.total,
      accuracy,
      predictionEarnings: value.gain,
    };
  });
}

export async function fetchRanking(type: RankingType, limit = 50) {
  let rows: AggregatedUser[] = [];

  if (type === 'invite') {
    rows = await aggregateInviteRanking();
  } else if (type === 'whale') {
    rows = await aggregateWhaleRanking();
  } else {
    rows = await aggregateProphetRanking();
  }

  const sorted = rows.sort((a, b) => b.score - a.score).slice(0, limit);

  return sorted.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    username: row.username ?? shortenWallet(row.wallet),
    score: row.score,
    delta: 0,
    badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : undefined,
    inviteEarnings: row.inviteEarnings,
    predictionEarnings: row.predictionEarnings,
    predictions: row.predictions,
    accuracy: row.accuracy,
  }));
}

export async function fetchUserRank(type: RankingType, userId: string) {
  const ranking = await fetchRanking(type, 200);
  const found = ranking.find(entry => entry.userId === userId);

  return found ? found.rank : null;
}
