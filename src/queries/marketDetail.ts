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
  yesOdds: number;
  noOdds: number;
  // DAO rewards
  juryReward: number;        // 陪审员奖励池（1%）
  rewardPerJuror: number;    // 每位陪审员可得
  creatorReward: number;     // 创建者奖励（0.5%）
};

export type MarketDetailData = {
  systemInfo: MarketSystemInfo;
  betModal: ReturnType<typeof loadBetModalSnapshot> extends Promise<infer T> ? T : never;
  bets: ReturnType<typeof loadMarketDetail> extends Promise<infer T> ? T['bets'] : never;
};

export const marketDetailQuery = (
  id: string,
): QueryOptions<MarketDetailData, Error, MarketDetailData, ['market', 'detail', string]> => ({
  queryKey: ['market', 'detail', id],
  queryFn: async () => {
    const market = await loadMarketDetail(id);
    const betModal = await loadBetModalSnapshot(id);

    // Calculate DAO rewards
    const juryCount = market.juryCount || 7;
    const juryReward = Math.max(100, Math.round(market.jurorRewardTai ?? market.pool * 0.01));
    const rewardPerJuror = juryCount > 0 ? Math.floor(juryReward / juryCount) : juryReward;
    const creatorReward = Math.floor(juryReward * 0.1); // 10% buffer for creator rebate

    return {
      systemInfo: {
        id: market.id,
        title: market.title,
        description: market.description,
        pool: market.pool,
        participants: market.participants ?? market.bets.length,
        endTime: market.endsAt,
        juryCount,
        odds: market.odds,
        yesOdds: market.yesOdds,
        noOdds: market.noOdds,
        juryReward,
        rewardPerJuror,
        creatorReward,
      },
      betModal,
      bets: market.bets,
    } satisfies MarketDetailData;
  },
  enabled: Boolean(id),
});
