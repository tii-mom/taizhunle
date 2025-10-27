import { useEffect, useState } from 'react';

export function useCountDown(targetTimestamp: number) {
  const [remaining, setRemaining] = useState(() => {
    const now = Date.now();
    return Math.max(0, targetTimestamp - now);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTimestamp - now);
      setRemaining(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return {
    remaining,
    hours,
    minutes,
    seconds,
    isExpired: remaining === 0,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
}
