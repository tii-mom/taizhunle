import type { QueryOptions } from '@tanstack/react-query';

import { loadBetModalSnapshot, loadMarketDetail } from '../services/markets';

export type MarketSystemInfo = {
  id: string;
  title: string;
  description: string;
  pool: number;
  participants: number;
  endTime: number;
  juryCount: number;
  odds: string;
  volume: string;
  liquidity: string;
  bountyMultiplier: number;
};

export type MarketDetailData = {
  systemInfo: MarketSystemInfo;
  betModal: ReturnType<typeof loadBetModalSnapshot> extends Promise<infer T> ? T : never;
};

export const marketDetailQuery = (
  id: string,
): QueryOptions<MarketDetailData, Error, MarketDetailData, ['market', 'detail', string]> => ({
  queryKey: ['market', 'detail', id],
  queryFn: async () => {
    const market = await loadMarketDetail(id);
    const betModal = await loadBetModalSnapshot(id);

    return {
      systemInfo: {
        id: market.id,
        title: market.title,
        description: market.description,
        pool: market.pool,
        participants: market.bets.length,
        endTime: market.endsAt,
        juryCount: market.juryCount,
        odds: market.odds,
        volume: market.volume,
        liquidity: market.liquidity,
        bountyMultiplier: market.bountyMultiplier,
      },
      betModal,
    } satisfies MarketDetailData;
  },
  enabled: Boolean(id),
});
