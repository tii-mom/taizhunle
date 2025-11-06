import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { loadMarketOddsSeries } from '@/services/markets';
import { generateMockOddsSeries } from '@/components/market-detail/mockData';

type OddsSeriesQueryOptions = Pick<
  UseQueryOptions<ReturnType<typeof generateMockOddsSeries>, Error>,
  'enabled' | 'refetchInterval' | 'staleTime'
>;

export function useMarketOddsSeries(
  marketId: string,
  options?: OddsSeriesQueryOptions,
) {
  const enabled = Boolean(marketId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ['market', 'odds-series', marketId],
    queryFn: async () => {
      try {
        const series = await loadMarketOddsSeries(marketId);
        if (series.length) {
          return series;
        }
      } catch (error) {
        console.warn('[MockOddsSeries]', error);
      }
      return generateMockOddsSeries(marketId);
    },
    enabled,
    staleTime: options?.staleTime ?? 5_000,
    refetchInterval: options?.refetchInterval ?? 5_000,
  });
}
