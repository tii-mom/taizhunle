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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function fetchSaleStatus(): Promise<RedPacketSaleStatus> {
  const response = await fetch(`${API_BASE_URL}/redpacket/status`);

  if (!response.ok) {
    throw new Error('Failed to load red packet status');
  }

  return (await response.json()) as RedPacketSaleStatus;
}

export function useRedPacketSale() {
  return useQuery({
    queryKey: ['redpacket', 'sale', 'status'],
    queryFn: fetchSaleStatus,
    refetchInterval: 5000,
  });
}
