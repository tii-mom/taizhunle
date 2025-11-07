import { queryOptions } from '@tanstack/react-query';

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
  creatorStakeTai: number;   // 创建时质押
  stakeCooldownHours: number;
  tags: string[];
  referenceUrl: string | null;
  referenceSummary: string | null;
};

type MarketDetailResponse = Awaited<ReturnType<typeof loadMarketDetail>>;
type BetModalSnapshot = Awaited<ReturnType<typeof loadBetModalSnapshot>>;

export type MarketDetailData = {
  systemInfo: MarketSystemInfo;
  betModal: BetModalSnapshot;
  bets: MarketDetailResponse['bets'];
};

export const marketDetailQuery = (
  id: string,
)=>
  queryOptions<MarketDetailData, Error, MarketDetailData, ['market', 'detail', string]>({
    queryKey: ['market', 'detail', id],
    queryFn: async () => {
      const market = await loadMarketDetail(id);
      const betModal = await loadBetModalSnapshot(id);

    // Calculate DAO rewards
    const juryCount = market.juryCount || 7;
    const juryReward = Math.round(market.pool * 0.01);
    const rewardPerJuror = juryCount > 0 ? Math.floor(juryReward / juryCount) : juryReward;

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
          creatorStakeTai: market.creatorStakeTai,
          stakeCooldownHours: market.stakeCooldownHours ?? 72,
          tags: market.tags ?? market.topicTags ?? [],
          referenceUrl: market.referenceUrl ?? null,
          referenceSummary: market.referenceSummary ?? null,
        },
        betModal,
        bets: market.bets,
      } satisfies MarketDetailData;
    },
  });
