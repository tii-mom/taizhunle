import type { QueryOptions } from '@tanstack/react-query';

import { loadBetModalSnapshot } from '../services/markets';

export type BetModalData = Awaited<ReturnType<typeof loadBetModalSnapshot>>;

export const betQuery = (
  id: string,
): QueryOptions<BetModalData, Error, BetModalData, ['market', 'bet', string]> => ({
  queryKey: ['market', 'bet', id],
  queryFn: async () => loadBetModalSnapshot(id),
  enabled: Boolean(id),
});
