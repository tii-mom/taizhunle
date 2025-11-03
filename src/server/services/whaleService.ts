import { supabase } from './supabaseClient.js';
import { toNumber } from '../utils/number.js';

function shorten(wallet: string | null | undefined): string {
  if (!wallet) return 'anon';
  return wallet.length > 10 ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : wallet;
}

export async function fetchWhaleRankings(limit = 50) {
  const { data, error } = await supabase
    .from('whale_rankings')
    .select('wallet_address, amount_tai, rank, updated_at')
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load whale rankings: ${error.message}`);
  }

  return (data ?? []).map(entry => ({
    rank: entry.rank ?? 0,
    wallet: shorten(entry.wallet_address),
    amount: toNumber(entry.amount_tai),
    walletAddress: entry.wallet_address,
    timestamp: entry.updated_at ? new Date(entry.updated_at).getTime() : Date.now(),
  }));
}
