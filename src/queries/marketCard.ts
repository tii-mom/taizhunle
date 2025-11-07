import { queryOptions } from '@tanstack/react-query';

import { loadMarketSnapshot, type MarketSnapshot } from '../services/markets';

export const marketCardQuery = (
  id: string,
)=>
  queryOptions<MarketSnapshot, Error, MarketSnapshot, ['market', 'card', string]>({
    queryKey: ['market', 'card', id],
    queryFn: () => loadMarketSnapshot(id),
  });
