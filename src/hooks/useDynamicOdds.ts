import { useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export type OddsData = {
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  fluctuation: number;
};

const DEFAULT_ODDS: OddsData = {
  yesOdds: 1.5,
  noOdds: 1.5,
  yesPool: 0,
  noPool: 0,
  totalPool: 0,
  fluctuation: 0,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function fetchOdds(marketId: string): Promise<OddsData> {
  const response = await fetch(`${API_BASE_URL}/markets/${marketId}/odds`);

  if (!response.ok) {
    throw new Error('Failed to load odds');
  }

  return (await response.json()) as OddsData;
}

export function useDynamicOdds(
  marketId: string,
  betAmount: number = 0,
  betSide: 'yes' | 'no' | null = null,
) {
  const previousRef = useRef<OddsData | null>(null);

  const { data: odds = DEFAULT_ODDS } = useQuery<OddsData>({
    queryKey: ['market', marketId, 'odds'],
    queryFn: () => fetchOdds(marketId),
    enabled: Boolean(marketId),
    refetchInterval: 3000,
  });

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

  const projectedOdds = useMemo(() => {
    if (!betSide || betAmount <= 0) {
      return null;
    }

    const totalPool = odds.totalPool + betAmount;
    const yesPool = betSide === 'yes' ? odds.yesPool + betAmount : odds.yesPool;
    const noPool = betSide === 'no' ? odds.noPool + betAmount : odds.noPool;

    const compute = (pool: number) => {
      if (pool <= 0) {
        return 1.5;
      }
      return Number(Math.max(1.01, totalPool / pool).toFixed(2));
    };

    return {
      yesOdds: compute(yesPool),
      noOdds: compute(noPool),
    };
  }, [betAmount, betSide, odds]);

  return {
    odds,
    projectedOdds,
    hasChanged,
  };
}
