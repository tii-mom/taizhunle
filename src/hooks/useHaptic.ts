import { useCallback } from 'react';

export function useHaptic() {
  const vibrate = useCallback((duration: number = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  return { vibrate };
}
