import { queryOptions } from '@tanstack/react-query';

import { loadBetModalSnapshot } from '../services/markets';

export type BetModalData = Awaited<ReturnType<typeof loadBetModalSnapshot>>;

export const betQuery = (
  id: string,
)=>
  queryOptions<BetModalData, Error, BetModalData, ['market', 'bet', string]>({
    queryKey: ['market', 'bet', id],
    queryFn: () => loadBetModalSnapshot(id),
  });
