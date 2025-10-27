import { useQuery } from '@tanstack/react-query';

export type RedPacketSaleStatus = {
  priceTON: number;
  soldTAI: number;
  totalTAI: number;
  countdown: number;
  soldOut: boolean;
  accelerate: boolean;
  priceAdjustment: number;
};

async function fetchSaleStatus(): Promise<RedPacketSaleStatus> {
  // TODO: Replace with real API call
  // const response = await fetch('/api/redpacket/status');
  // return response.json();
  
  // Mock data for development
  return {
    priceTON: 9.99,
    soldTAI: 750000,
    totalTAI: 1000000,
    countdown: Date.now() + 1000 * 60 * 60 * 23,
    soldOut: false,
    accelerate: false,
    priceAdjustment: 0,
  };
}

export function useRedPacketSale() {
  return useQuery({
    queryKey: ['redpacket', 'sale', 'status'],
    queryFn: fetchSaleStatus,
    refetchInterval: 5000,
  });
}
