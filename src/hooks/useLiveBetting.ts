import { useQuery } from '@tanstack/react-query';

export type LiveBet = {
  id: string;
  user: string;
  amount: number;
  side: 'yes' | 'no';
  timestamp: number;
};

export type LiveStats = {
  totalBets: number;
  totalVolume: number;
  uniqueBettors: number;
  recentBets: LiveBet[];
};

async function fetchLiveBetting(_marketId: string): Promise<LiveStats> {
  // TODO: Replace with real API call
  // const response = await fetch(`/api/market/${marketId}/live`);
  // return response.json();

  // Mock data
  return {
    totalBets: 1247,
    totalVolume: 1000000,
    uniqueBettors: 342,
    recentBets: [
      {
        id: '1',
        user: 'Amber',
        amount: 12000,
        side: 'yes',
        timestamp: Date.now() - 1000 * 30,
      },
      {
        id: '2',
        user: 'DeepBlue',
        amount: 8500,
        side: 'no',
        timestamp: Date.now() - 1000 * 60,
      },
      {
        id: '3',
        user: 'Validator Yun',
        amount: 4200,
        side: 'yes',
        timestamp: Date.now() - 1000 * 90,
      },
    ],
  };
}

export function useLiveBetting(marketId: string) {
  return useQuery({
    queryKey: ['market', marketId, 'live'],
    queryFn: () => fetchLiveBetting(marketId),
    refetchInterval: 5000,
  });
}
