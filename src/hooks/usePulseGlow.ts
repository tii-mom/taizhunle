import { useEffect, useState } from 'react';

export function usePulseGlow(value: number | string | undefined) {
  const [shouldGlow, setShouldGlow] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue && value !== undefined) {
      setShouldGlow(true);
      setPrevValue(value);

      const timer = window.setTimeout(() => {
        setShouldGlow(false);
      }, 1000); // Duration matches animation (500ms * 2 iterations)

      return () => window.clearTimeout(timer);
    }
  }, [value, prevValue]);

  return shouldGlow;
}
