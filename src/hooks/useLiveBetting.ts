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

async function fetchLiveBetting(_marketId: string): Promise<LiveStats> {
  // TODO: Replace with real API call
  // const response = await fetch(`/api/market/${marketId}/live`);
  // return response.json();

  // Mock data - 实时更新
  const baseInviteRewards = 8500 + Math.floor(Math.random() * 200);
  const maxBetAmount = 12000 + Math.floor(Math.random() * 3000);
  const maxBetUsers = ['pBlue', 'Validator Yun', 'Amber', 'DeepWhale', 'CryptoKing'];
  const randomUser = maxBetUsers[Math.floor(Math.random() * maxBetUsers.length)];

  return {
    inviteRewards: baseInviteRewards,
    maxSingleBet: maxBetAmount,
    maxBetUser: randomUser,
    uniqueBettors: 342 + Math.floor(Math.random() * 10),
    recentBets: [
      {
        id: '1',
        user: 'pBlue',
        amount: 8500,
        side: 'no',
        timestamp: Date.now() - 1000 * 30,
      },
      {
        id: '2',
        user: 'Validator Yun',
        amount: 4200,
        side: 'yes',
        timestamp: Date.now() - 1000 * 60,
      },
      {
        id: '3',
        user: 'Amber',
        amount: 12000,
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
