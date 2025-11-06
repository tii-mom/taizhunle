import { supabase } from './supabaseClient.js';

export type OddsSequenceInsert = {
  marketId: string;
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
};

export type OddsSequenceRow = {
  id: number;
  market_id: string;
  yes_odds: number;
  no_odds: number;
  yes_pool: number;
  no_pool: number;
  total_pool: number;
  created_at: string;
};

export async function recordOddsSequence(payload: OddsSequenceInsert): Promise<OddsSequenceRow | null> {
  try {
    const { data, error } = await supabase
      .from('odds_sequence')
      .insert({
        market_id: payload.marketId,
        yes_odds: payload.yesOdds,
        no_odds: payload.noOdds,
        yes_pool: payload.yesPool,
        no_pool: payload.noPool,
        total_pool: payload.totalPool,
      })
      .select('id, market_id, yes_odds, no_odds, yes_pool, no_pool, total_pool, created_at')
      .single<OddsSequenceRow>();

    if (error) {
      throw error;
    }

    return data ?? null;
  } catch (error) {
    console.error('Failed to record odds sequence:', error);
    return null;
  }
}

export async function fetchOddsSequenceSince(marketId: string, afterId: number): Promise<OddsSequenceRow[]> {
  try {
    const { data, error } = await supabase
      .from('odds_sequence')
      .select('*')
      .eq('market_id', marketId)
      .gt('id', afterId)
      .order('id', { ascending: true })
      .limit(100);

    if (error) {
      throw error;
    }

    return (data ?? []) as OddsSequenceRow[];
  } catch (error) {
    console.error('Failed to fetch odds sequence:', error);
    return [];
  }
}

export async function fetchLatestOddsSequence(marketId: string): Promise<OddsSequenceRow | null> {
  try {
    const { data, error } = await supabase
      .from('odds_sequence')
      .select('*')
      .eq('market_id', marketId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle<OddsSequenceRow>();

    if (error) {
      throw error;
    }

    return data ?? null;
  } catch (error) {
    console.error('Failed to fetch latest odds sequence:', error);
    return null;
  }
}
