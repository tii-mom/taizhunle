import { MarketOddsConfig, getOddsConfig, getDefaultOddsConfig } from '../config/oddsConfig.js';

export type OddsComputationInput = {
  totalPool: number;
  sidePool: number;
  config?: MarketOddsConfig;
};

export async function computeOddsAsync({ totalPool, sidePool, config }: OddsComputationInput): Promise<number> {
  const resolvedConfig = config ?? await getOddsConfig();
  return computeOdds({ totalPool, sidePool, config: resolvedConfig });
}

export function computeOdds({ totalPool, sidePool, config }: OddsComputationInput): number {
  const resolvedConfig = config ?? getDefaultOddsConfig();

  if (totalPool <= 0 && sidePool <= 0) {
    return Number(resolvedConfig.defaultOdds.toFixed(2));
  }

  const positiveTotal = Math.max(totalPool, 0);
  const positiveSide = Math.max(sidePool, 0);

  if (positiveTotal === 0) {
    return Number(resolvedConfig.defaultOdds.toFixed(2));
  }

  const cappedSide = Math.min(positiveSide, positiveTotal * resolvedConfig.sideCapRatio);
  const actualOther = Math.max(positiveTotal - positiveSide, 0);
  const minOtherByRatio = positiveTotal * resolvedConfig.otherFloorRatio;
  const floorPool = Math.max(positiveTotal * resolvedConfig.minPoolRatio, resolvedConfig.minAbsolutePool);
  const effectiveOther = Math.max(actualOther, minOtherByRatio, floorPool);
  const effectiveTotal = cappedSide + effectiveOther;
  const denominator = Math.max(cappedSide, resolvedConfig.minAbsolutePool);

  if (denominator <= 0) {
    return Number(resolvedConfig.defaultOdds.toFixed(2));
  }

  const rawOdds = effectiveTotal / denominator;
  const limitedOdds = Math.min(Math.max(rawOdds, resolvedConfig.minOdds), resolvedConfig.maxOdds);

  return Number(limitedOdds.toFixed(2));
}

export function computeImpactAdjustedStake(
  amount: number,
  poolBefore: number,
  config: MarketOddsConfig,
): {
  effectiveStake: number;
  impactFee: number;
  impactMultiplier: number;
} {
  const safePool = Math.max(poolBefore, config.impactMinPool, 1);
  const ratio = amount / safePool;
  const multiplier = 1 + Math.min(ratio * config.impactFeeCoefficient, Math.max(config.impactMaxMultiplier - 1, 0));
  const impactMultiplier = Math.min(multiplier, config.impactMaxMultiplier);
  const effectiveStake = Number((amount / impactMultiplier).toFixed(2));
  const impactFee = Number((amount - effectiveStake).toFixed(2));

  return {
    effectiveStake,
    impactFee,
    impactMultiplier,
  };
}
