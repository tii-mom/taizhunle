import type { QueryOptions } from '@tanstack/react-query';

import { loadMarketSnapshot, type MarketSnapshot } from '../services/markets';

export const marketCardQuery = (
  id: string,
): QueryOptions<MarketSnapshot, Error, MarketSnapshot, ['market', 'card', string]> => ({
  queryKey: ['market', 'card', id],
  queryFn: async () => loadMarketSnapshot(id),
  enabled: Boolean(id),
});
