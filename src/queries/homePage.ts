import type { QueryFunctionContext } from '@tanstack/react-query';

import type { MarketCard, MarketSortKey } from '../services/markets';
import { loadMarketFeed } from '../services/markets';

export type HomeFeedPage = {
  daoPool: number;
  items: MarketCard[];
  nextCursor?: string;
};

export const HOME_PAGE_LIMIT = 20;

type HomeQueryKey = ['home', 'glass', MarketSortKey];

export const homePageQuery = (sort: MarketSortKey) => ({
  queryKey: ['home', 'glass', sort] as HomeQueryKey,
  initialPageParam: undefined as string | undefined,
  queryFn: async ({ pageParam }: QueryFunctionContext<HomeQueryKey, string | undefined>) => {
    const feed = await loadMarketFeed({ sort, cursor: pageParam, limit: HOME_PAGE_LIMIT });
    return {
      daoPool: feed.daoPool ?? feed.items.reduce((sum, market) => sum + market.pool, 0),
      items: feed.items,
      nextCursor: feed.nextCursor,
    } satisfies HomeFeedPage;
  },
  getNextPageParam: (lastPage: HomeFeedPage) => lastPage.nextCursor,
});
