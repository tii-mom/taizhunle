import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type OddsMeta = {
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

type OddsImpactSnapshot = {
  sequence: number;
  timestamp: number;
  side: 'yes' | 'no';
  amount: number;
  netContribution: number;
  impactFee: number;
  impactMultiplier: number;
  feeAmount: number;
};

type ProjectedOdds = {
  yesOdds: number;
  noOdds: number;
  effectiveStake: number;
  impactFee: number;
  impactMultiplier: number;
};

export type OddsData = {
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  fluctuation: number;
  meta?: OddsMeta;
  lastUpdate?: OddsImpactSnapshot;
};

const DEFAULT_META: OddsMeta = {
  minOdds: 1.01,
  maxOdds: 9,
  defaultOdds: 1.5,
  minPoolRatio: 0.4,
  minAbsolutePool: 10,
  sideCapRatio: 0.5,
  otherFloorRatio: 0.1,
  impactFeeCoefficient: 0.5,
  impactMinPool: 50,
  impactMaxMultiplier: 3,
  sseFallbackMs: 1000,
};

const DEFAULT_ODDS: OddsData = {
  yesOdds: 1.5,
  noOdds: 1.5,
  yesPool: 0,
  noPool: 0,
  totalPool: 0,
  fluctuation: 0,
  meta: DEFAULT_META,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type ApiOddsResponse = OddsData & { meta?: OddsMeta };

type OddsStreamPayload = {
  sequence: number;
  marketId: string;
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  timestamp: number;
  side?: 'yes' | 'no';
  amount?: number;
  netContribution?: number;
  impactFee?: number;
  impactMultiplier?: number;
  feeAmount?: number;
};

async function fetchOdds(marketId: string): Promise<OddsData> {
  const response = await fetch(`${API_BASE_URL}/markets/${marketId}/odds`);

  if (!response.ok) {
    throw new Error('Failed to load odds');
  }

  const payload = (await response.json()) as ApiOddsResponse;

  return {
    yesOdds: Number(payload.yesOdds ?? DEFAULT_ODDS.yesOdds),
    noOdds: Number(payload.noOdds ?? DEFAULT_ODDS.noOdds),
    yesPool: Number(payload.yesPool ?? DEFAULT_ODDS.yesPool),
    noPool: Number(payload.noPool ?? DEFAULT_ODDS.noPool),
    totalPool: Number(payload.totalPool ?? DEFAULT_ODDS.totalPool),
    fluctuation: Number(payload.fluctuation ?? DEFAULT_ODDS.fluctuation),
    meta: payload.meta ?? DEFAULT_META,
  } satisfies OddsData;
}

function computeImpactAdjustedStake(amount: number, poolBefore: number, meta?: OddsMeta) {
  if (!meta || amount <= 0) {
    return {
      effectiveStake: amount,
      impactFee: 0,
      impactMultiplier: 1,
    };
  }

  const safePool = Math.max(poolBefore, meta.impactMinPool, 1);
  const ratio = amount / safePool;
  const maxExtra = Math.max(meta.impactMaxMultiplier - 1, 0);
  const multiplier = 1 + Math.min(ratio * meta.impactFeeCoefficient, maxExtra);
  const impactMultiplier = Math.min(multiplier, meta.impactMaxMultiplier);
  const effectiveStake = Number((amount / impactMultiplier).toFixed(2));
  const impactFee = Number((amount - effectiveStake).toFixed(2));

  return {
    effectiveStake,
    impactFee,
    impactMultiplier,
  };
}

function computeProjectedOdds(totalPool: number, sidePool: number, meta?: OddsMeta): number {
  if (!meta) {
    if (totalPool <= 0 || sidePool <= 0) {
      return DEFAULT_META.defaultOdds;
    }
    return Number(Math.max(1.01, totalPool / sidePool).toFixed(2));
  }

  if (totalPool <= 0 && sidePool <= 0) {
    return Number(meta.defaultOdds.toFixed(2));
  }

  const positiveTotal = Math.max(totalPool, 0);
  const positiveSide = Math.max(sidePool, 0);

  if (positiveTotal === 0) {
    return Number(meta.defaultOdds.toFixed(2));
  }

  const cappedSide = Math.min(positiveSide, positiveTotal * meta.sideCapRatio);
  const actualOther = Math.max(positiveTotal - positiveSide, 0);
  const minOtherByRatio = positiveTotal * meta.otherFloorRatio;
  const floorPool = Math.max(positiveTotal * meta.minPoolRatio, meta.minAbsolutePool);
  const effectiveOther = Math.max(actualOther, minOtherByRatio, floorPool);
  const effectiveTotal = cappedSide + effectiveOther;
  const denominator = Math.max(cappedSide, meta.minAbsolutePool);

  if (denominator <= 0) {
    return Number(meta.defaultOdds.toFixed(2));
  }

  const rawOdds = effectiveTotal / denominator;
  const limitedOdds = Math.min(Math.max(rawOdds, meta.minOdds), meta.maxOdds);

  return Number(limitedOdds.toFixed(2));
}

export function useDynamicOdds(
  marketId: string,
  betAmount: number = 0,
  betSide: 'yes' | 'no' | null = null,
) {
  const previousRef = useRef<OddsData | null>(null);
  const queryClient = useQueryClient();
  const [shouldPoll, setShouldPoll] = useState(true);
  const [pollInterval, setPollInterval] = useState(DEFAULT_META.sseFallbackMs);

  const { data: odds = DEFAULT_ODDS } = useQuery<OddsData>({
    queryKey: ['market', marketId, 'odds'],
    queryFn: () => fetchOdds(marketId),
    enabled: Boolean(marketId),
    refetchInterval: shouldPoll ? pollInterval : false,
  });

  useEffect(() => {
    const nextInterval = odds.meta?.sseFallbackMs ?? DEFAULT_META.sseFallbackMs;
    setPollInterval((current) => (current === nextInterval ? current : nextInterval));
  }, [odds.meta?.sseFallbackMs]);

  useEffect(() => {
    if (!marketId || typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      setShouldPoll(true);
      return;
    }

    let cancelled = false;
    const source = new EventSource(`${API_BASE_URL}/odds-stream/${marketId}`);

    const handleEvent = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as OddsStreamPayload;
        queryClient.setQueryData<OddsData>(['market', marketId, 'odds'], (previous) => {
          const base = previous ?? DEFAULT_ODDS;
          const fluctuation = Math.max(
            Math.abs(Number((payload.yesOdds - base.yesOdds).toFixed(2))),
            Math.abs(Number((payload.noOdds - base.noOdds).toFixed(2))),
          );

          const lastUpdate = payload.side
            ? {
                sequence: payload.sequence,
                timestamp: payload.timestamp,
                side: payload.side,
                amount: Number(payload.amount ?? 0),
                netContribution: Number(payload.netContribution ?? 0),
                impactFee: Number(payload.impactFee ?? 0),
                impactMultiplier: Number(payload.impactMultiplier ?? 1),
                feeAmount: Number(payload.feeAmount ?? 0),
              }
            : base.lastUpdate;

          return {
            ...base,
            yesOdds: Number(payload.yesOdds.toFixed(2)),
            noOdds: Number(payload.noOdds.toFixed(2)),
            yesPool: Number(payload.yesPool.toFixed(2)),
            noPool: Number(payload.noPool.toFixed(2)),
            totalPool: Number(payload.totalPool.toFixed(2)),
            fluctuation,
            lastUpdate,
          } satisfies OddsData;
        });
      } catch (error) {
        console.warn('[OddsStream] Failed to parse payload', error);
      }
    };

    source.addEventListener('odds', handleEvent as EventListener);

    source.onopen = () => {
      if (!cancelled) {
        setShouldPoll(false);
      }
    };

    source.onerror = () => {
      if (!cancelled) {
        setShouldPoll(true);
      }
      source.close();
    };

    return () => {
      cancelled = true;
      source.removeEventListener('odds', handleEvent as EventListener);
      source.close();
      setShouldPoll(true);
    };
  }, [marketId, queryClient]);

  const hasChanged = useMemo(() => {
    if (!previousRef.current) {
      previousRef.current = odds;
      return false;
    }

    const changed =
      previousRef.current.yesOdds !== odds.yesOdds || previousRef.current.noOdds !== odds.noOdds;

    previousRef.current = odds;
    return changed;
  }, [odds]);

  const projectedOdds = useMemo<ProjectedOdds | null>(() => {
    if (!betSide || betAmount <= 0) {
      return null;
    }

    const meta = odds.meta ?? DEFAULT_META;
    const poolBefore = betSide === 'yes' ? odds.yesPool : odds.noPool;
    const { effectiveStake, impactFee, impactMultiplier } = computeImpactAdjustedStake(betAmount, poolBefore, meta);

    const projectedTotal = odds.totalPool + effectiveStake;
    const projectedYesPool = betSide === 'yes' ? odds.yesPool + effectiveStake : odds.yesPool;
    const projectedNoPool = betSide === 'no' ? odds.noPool + effectiveStake : odds.noPool;

    return {
      yesOdds: computeProjectedOdds(projectedTotal, projectedYesPool, meta),
      noOdds: computeProjectedOdds(projectedTotal, projectedNoPool, meta),
      effectiveStake,
      impactFee,
      impactMultiplier,
    } satisfies ProjectedOdds;
  }, [betAmount, betSide, odds]);

  return {
    odds,
    projectedOdds,
    hasChanged,
  };
}
