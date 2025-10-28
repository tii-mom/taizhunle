import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

const delay = async <T,>(value: T, ms = 300) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export type MarketFilter = 'all' | 'live' | 'closed' | 'my';

export type MarketBet = {
  id: string;
  user: string;
  amount: number;
  market: string;
  direction: 'long' | 'short';
  timestamp: number;
};

export type MarketCard = {
  id: string;
  filter: 'live' | 'closed';
  isMine?: boolean;
  title: string;
  description: string;
  status: string;
  odds: string;
  volume: string;
  pool: number;
  bets: MarketBet[];
};

const MARKET_LIST: MarketCard[] = [
  {
    id: 'btc',
    filter: 'live',
    isMine: true,
    title: 'BTC crosses $80k before Friday',
    description: 'Community sentiment aligns with macro catalysts.',
    status: 'Live odds',
    odds: '1.67x',
    volume: '32,406 TAI',
    pool: 32406,
    bets: [
      { id: 'btc-1', user: 'pBlue', amount: 8500, market: 'btc', direction: 'long', timestamp: 1740200000 },
      { id: 'btc-2', user: 'Validator Yun', amount: 4200, market: 'btc', direction: 'short', timestamp: 1740198000 },
      { id: 'btc-3', user: 'Amber', amount: 12000, market: 'btc', direction: 'long', timestamp: 1740196000 },
    ],
  },
  {
    id: 'eth',
    filter: 'live',
    title: 'ETH staking APY drops under 3%',
    description: 'Validators react to upcoming network upgrades.',
    status: 'Live odds',
    odds: '2.45x',
    volume: '12,887 TAI',
    pool: 12887,
    bets: [
      { id: 'eth-1', user: 'Validator Yun', amount: 800, market: 'eth', direction: 'long', timestamp: 1740195000 },
      { id: 'eth-2', user: 'Amber', amount: 4200, market: 'eth', direction: 'long', timestamp: 1740193000 },
      { id: 'eth-3', user: 'pBlue', amount: 3500, market: 'eth', direction: 'short', timestamp: 1740192000 },
    ],
  },
  {
    id: 'ton',
    filter: 'closed',
    title: 'TON TVL hits all-time high',
    description: 'Layer-1 incentives draw whales back to TON.',
    status: 'Settled odds',
    odds: '9.30x',
    volume: '5,204 TAI',
    pool: 5204,
    bets: [
      { id: 'ton-1', user: 'DeepBlue', amount: 2100, market: 'ton', direction: 'long', timestamp: 1740189000 },
      { id: 'ton-2', user: 'Navigator', amount: 600, market: 'ton', direction: 'short', timestamp: 1740184000 },
      { id: 'ton-3', user: 'Whale C', amount: 1500, market: 'ton', direction: 'long', timestamp: 1740181000 },
    ],
  },
];

const MARKET_DETAIL: Record<string, MarketCard & { liquidity: string }> = {
  btc: { ...MARKET_LIST[0], liquidity: '18,500 TAI' },
  eth: { ...MARKET_LIST[1], liquidity: '9,400 TAI' },
  ton: { ...MARKET_LIST[2], liquidity: '2,300 TAI' },
};

const queryKeys = {
  markets: (filter: MarketFilter) => ['markets', filter] as const,
  marketDetail: (id: string) => ['markets', 'detail', id] as const,
};

const fetchMarkets = async (filter: MarketFilter) => {
  if (filter === 'all') {
    return delay(MARKET_LIST);
  }
  if (filter === 'my') {
    return delay(MARKET_LIST.filter((market) => market.isMine));
  }
  return delay(MARKET_LIST.filter((market) => market.filter === filter));
};

export const useMarketsQuery = (filter: MarketFilter = 'all'): UseQueryResult<MarketCard[]> =>
  useQuery({
    queryKey: queryKeys.markets(filter),
    queryFn: () => fetchMarkets(filter),
  });

export const useMarketDetailQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.marketDetail(id),
    queryFn: async () => delay(MARKET_DETAIL[id] ?? { ...MARKET_LIST[0], id }),
    enabled: Boolean(id),
  });

export const usePlaceBetMutation = () => {
  const mutationFn = useCallback(async () => delay({ success: true }), []);
  return useMutation({ mutationFn });
};
