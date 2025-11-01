import { useState, useEffect } from 'react';

type RedPacketData = {
  total: number;
  claimed: number;
  lastClaimTime?: string;
};

type PredictionData = {
  total: number;
  winRate: number;
  totalProfit: number;
  recentPredictions: Array<{
    id: string;
    result: 'win' | 'loss';
    profit: number;
  }>;
};

type AssetData = {
  balance: number;
  change24h: number;
  redPackets: RedPacketData | null;
  predictions: PredictionData | null;
};

// Mock data - replace with real API call
const MOCK_DATA: AssetData = {
  balance: 12345.67,
  change24h: 5.23,
  redPackets: {
    total: 10,
    claimed: 7,
    lastClaimTime: '2025-10-28T10:30:00Z',
  },
  predictions: {
    total: 42,
    winRate: 68.5,
    totalProfit: 2345.89,
    recentPredictions: [],
  },
};

export function useAssetData() {
  const [data, setData] = useState<AssetData>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/assets');
      // const result = await response.json();
      // setData(result);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(MOCK_DATA);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch asset data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    balance: data.balance,
    change24h: data.change24h,
    redPackets: data.redPackets,
    predictions: data.predictions,
    isLoading,
    error,
    refetch: fetchData,
  };
}
