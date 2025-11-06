import { supabase } from '../services/supabaseClient.js';
import config from '../../config/env.js';

export type MarketOddsConfig = {
  sideCapRatio: number;
  otherFloorRatio: number;
  minPoolRatio: number;
  minAbsolutePool: number;
  impactFeeCoefficient: number;
  impactMinPool: number;
  impactMaxMultiplier: number;
  minOdds: number;
  maxOdds: number;
  defaultOdds: number;
  sseRefetchFallbackMs: number;
};

type MarketOddsConfigRow = {
  side_cap_ratio?: number | null;
  other_floor_ratio?: number | null;
  min_pool_ratio?: number | null;
  min_absolute_pool?: number | null;
  impact_fee_coefficient?: number | null;
  impact_min_pool?: number | null;
  impact_max_multiplier?: number | null;
  min_odds?: number | null;
  max_odds?: number | null;
  default_odds?: number | null;
  sse_refetch_fallback_ms?: number | null;
};

export const DEFAULT_MARKET_ODDS_CONFIG: MarketOddsConfig = {
  sideCapRatio: 0.5,
  otherFloorRatio: 0.1,
  minPoolRatio: 0.4,
  minAbsolutePool: 10,
  impactFeeCoefficient: 0.5,
  impactMinPool: 50,
  impactMaxMultiplier: 3,
  minOdds: 1.01,
  maxOdds: 9,
  defaultOdds: 1.5,
  sseRefetchFallbackMs: 1000,
};

let cachedConfig: MarketOddsConfig = { ...DEFAULT_MARKET_ODDS_CONFIG };
let lastLoaded = 0;
const CACHE_TTL_MS = 30_000;

function normaliseNumber(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number') {
    return fallback;
  }
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export async function refreshOddsConfig(): Promise<MarketOddsConfig> {
  try {
    const { data, error } = await supabase
      .from('market_odds_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle<MarketOddsConfigRow>();

    if (error) {
      throw error;
    }

    if (!data) {
      cachedConfig = { ...DEFAULT_MARKET_ODDS_CONFIG };
      lastLoaded = Date.now();
      return cachedConfig;
    }

    cachedConfig = {
      sideCapRatio: normaliseNumber(data.side_cap_ratio, DEFAULT_MARKET_ODDS_CONFIG.sideCapRatio),
      otherFloorRatio: normaliseNumber(data.other_floor_ratio, DEFAULT_MARKET_ODDS_CONFIG.otherFloorRatio),
      minPoolRatio: normaliseNumber(data.min_pool_ratio, DEFAULT_MARKET_ODDS_CONFIG.minPoolRatio),
      minAbsolutePool: normaliseNumber(data.min_absolute_pool, DEFAULT_MARKET_ODDS_CONFIG.minAbsolutePool),
      impactFeeCoefficient: normaliseNumber(data.impact_fee_coefficient, DEFAULT_MARKET_ODDS_CONFIG.impactFeeCoefficient),
      impactMinPool: normaliseNumber(data.impact_min_pool, DEFAULT_MARKET_ODDS_CONFIG.impactMinPool),
      impactMaxMultiplier: normaliseNumber(data.impact_max_multiplier, DEFAULT_MARKET_ODDS_CONFIG.impactMaxMultiplier),
      minOdds: normaliseNumber(data.min_odds, DEFAULT_MARKET_ODDS_CONFIG.minOdds),
      maxOdds: normaliseNumber(data.max_odds, DEFAULT_MARKET_ODDS_CONFIG.maxOdds),
      defaultOdds: normaliseNumber(data.default_odds, DEFAULT_MARKET_ODDS_CONFIG.defaultOdds),
      sseRefetchFallbackMs: normaliseNumber(data.sse_refetch_fallback_ms, DEFAULT_MARKET_ODDS_CONFIG.sseRefetchFallbackMs),
    };

    lastLoaded = Date.now();
    return cachedConfig;
  } catch (error) {
    console.error('Failed to load market odds config:', error);
    cachedConfig = { ...DEFAULT_MARKET_ODDS_CONFIG };
    lastLoaded = Date.now();
    return cachedConfig;
  }
}

export async function getOddsConfig(force = false): Promise<MarketOddsConfig> {
  const now = Date.now();
  if (!force && now - lastLoaded < CACHE_TTL_MS) {
    return cachedConfig;
  }
  return refreshOddsConfig();
}

export function getDefaultOddsConfig(): MarketOddsConfig {
  const minPoolFromEnv = Number(config.business?.prediction?.minPool ?? 0);
  if (Number.isFinite(minPoolFromEnv) && minPoolFromEnv > 0) {
    return {
      ...DEFAULT_MARKET_ODDS_CONFIG,
      minAbsolutePool: minPoolFromEnv,
    };
  }
  return { ...DEFAULT_MARKET_ODDS_CONFIG };
}

export function __setCachedOddsConfig(value: MarketOddsConfig) {
  cachedConfig = value;
  lastLoaded = Date.now();
}
