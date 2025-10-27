import { useState, useEffect } from 'react';

export type OddsData = {
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  totalPool: number;
  fluctuation: number;
};

export function useDynamicOdds(marketId: string, betAmount: number = 0, betSide: 'yes' | 'no' | null = null) {
  const [odds, setOdds] = useState<OddsData>({
    yesOdds: 1.5,
    noOdds: 2.5,
    yesPool: 600000,
    noPool: 400000,
    totalPool: 1000000,
    fluctuation: 0,
  });

  const [prevOdds, setPrevOdds] = useState<OddsData>(odds);

  useEffect(() => {
    // TODO: Replace with real API call
    // const fetchOdds = async () => {
    //   const response = await fetch(`/api/market/${marketId}/odds`);
    //   const data = await response.json();
    //   setOdds(data);
    // };
    // fetchOdds();

    // Mock: Simulate odds changes every 3 seconds
    const interval = setInterval(() => {
      setOdds((current) => {
        const newYesPool = current.yesPool + Math.random() * 10000 - 5000;
        const newNoPool = current.noPool + Math.random() * 10000 - 5000;
        const newTotalPool = newYesPool + newNoPool;
        
        const newYesOdds = newTotalPool / newYesPool;
        const newNoOdds = newTotalPool / newNoPool;
        
        const fluctuation = ((newYesOdds - current.yesOdds) / current.yesOdds) * 100;

        setPrevOdds(current);

        return {
          yesOdds: newYesOdds,
          noOdds: newNoOdds,
          yesPool: newYesPool,
          noPool: newNoPool,
          totalPool: newTotalPool,
          fluctuation,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [marketId]);

  // Calculate projected odds with bet amount
  const projectedOdds = betAmount > 0 && betSide ? {
    yesOdds: betSide === 'yes' 
      ? (odds.totalPool + betAmount) / (odds.yesPool + betAmount)
      : (odds.totalPool + betAmount) / odds.yesPool,
    noOdds: betSide === 'no'
      ? (odds.totalPool + betAmount) / (odds.noPool + betAmount)
      : (odds.totalPool + betAmount) / odds.noPool,
  } : null;

  const hasChanged = odds.yesOdds !== prevOdds.yesOdds || odds.noOdds !== prevOdds.noOdds;

  return {
    odds,
    projectedOdds,
    hasChanged,
  };
}
