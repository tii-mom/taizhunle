import { useQuery } from '@tanstack/react-query';

export type OfficialRainStatus = {
  nextAt: number;
  remaining: number;
  qualify: boolean;
  ticketPrice: number;
  amountTAI: number;
};

async function fetchOfficialRain(): Promise<OfficialRainStatus> {
  // TODO: Replace with real API call
  // const response = await fetch('/api/official/next');
  // return response.json();
  
  // Mock data for development
  return {
    nextAt: Date.now() + 1000 * 60 * 60 * 2,
    remaining: 50,
    qualify: true,
    ticketPrice: 0.3,
    amountTAI: 10000000,
  };
}

export function useOfficialRain() {
  return useQuery({
    queryKey: ['official', 'rain', 'next'],
    queryFn: fetchOfficialRain,
    refetchInterval: 10000,
  });
}
