import { useQuery } from '@tanstack/react-query';

export type UserBalance = {
  balance: number;
  todayProfit: number;
};

async function fetchUserBalance(): Promise<UserBalance> {
  // TODO: Replace with real API call
  // const response = await fetch('/api/user/balance');
  // return response.json();

  // Mock data
  return {
    balance: 125000,
    todayProfit: 8500,
  };
}

export function useUserBalance() {
  return useQuery({
    queryKey: ['user', 'balance'],
    queryFn: fetchUserBalance,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
