import { useState, useEffect } from 'react';

type HistoryItem = {
  date: string;
  balance: number;
  profit: number;
  predictions: number;
};

type HistoryData = {
  items: HistoryItem[];
  totalProfit: number;
  totalPredictions: number;
  winRate: number;
};

// Mock data - replace with real API call
const MOCK_HISTORY: HistoryData = {
  items: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      balance: 10000 + Math.random() * 5000,
      profit: (Math.random() - 0.4) * 500,
      predictions: Math.floor(Math.random() * 5),
    };
  }),
  totalProfit: 2345.89,
  totalPredictions: 42,
  winRate: 68.5,
};

export function useHistory(days: number = 30) {
  const [data, setData] = useState<HistoryData>(MOCK_HISTORY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/assets/history?days=${days}`);
      // const result = await response.json();
      // setData(result);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(MOCK_HISTORY);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch history'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [days]);

  return {
    items: data.items.slice(-days),
    totalProfit: data.totalProfit,
    totalPredictions: data.totalPredictions,
    winRate: data.winRate,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
