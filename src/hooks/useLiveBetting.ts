import { useQuery } from '@tanstack/react-query';

export type LiveBet = {
  id: string;
  user: string;
  amount: number;
  side: 'yes' | 'no';
  timestamp: number;
};

export type LiveStats = {
  inviteRewards: number;
  maxSingleBet: number;
  maxBetUser: string;
  uniqueBettors: number;
  recentBets: LiveBet[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function fetchLiveBetting(marketId: string): Promise<LiveStats> {
  const response = await fetch(`${API_BASE_URL}/markets/${marketId}/live`);

  if (!response.ok) {
    throw new Error('Failed to load live betting data');
  }

  return (await response.json()) as LiveStats;
}

export function useLiveBetting(marketId: string) {
  return useQuery({
    queryKey: ['market', marketId, 'live'],
    queryFn: () => fetchLiveBetting(marketId),
    enabled: Boolean(marketId),
    refetchInterval: 5000,
  });
}
