import { useQuery } from '@tanstack/react-query';

export type OfficialRainStatus = {
  id: string;
  nextAt: number;
  remaining: number;
  qualify: boolean;
  ticketPrice: number;
  amountTAI: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function fetchOfficialRain(): Promise<OfficialRainStatus> {
  const response = await fetch(`${API_BASE_URL}/official/next`);

  if (!response.ok) {
    throw new Error('Failed to load official rain schedule');
  }

  return (await response.json()) as OfficialRainStatus;
}

export function useOfficialRain() {
  return useQuery({
    queryKey: ['official', 'rain', 'next'],
    queryFn: fetchOfficialRain,
    refetchInterval: 10000,
  });
}
