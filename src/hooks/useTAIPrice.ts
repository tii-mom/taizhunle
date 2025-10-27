import { useState, useEffect } from 'react';

type PriceData = {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: string;
};

// Mock data - replace with real API call
const MOCK_PRICE: PriceData = {
  price: 1.2345,
  change24h: 3.45,
  volume24h: 1234567.89,
  lastUpdate: new Date().toISOString(),
};

export function useTAIPrice() {
  const [data, setData] = useState<PriceData>(MOCK_PRICE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/tai/price');
      // const result = await response.json();
      // setData(result);
      
      // Simulate API delay and price fluctuation
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fluctuation = (Math.random() - 0.5) * 0.01;
      setData({
        ...MOCK_PRICE,
        price: MOCK_PRICE.price + fluctuation,
        lastUpdate: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch TAI price'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    price: data.price,
    change24h: data.change24h,
    volume24h: data.volume24h,
    lastUpdate: data.lastUpdate,
    isLoading,
    error,
    refetch: fetchPrice,
  };
}
