import { useEffect } from 'react';

import { triggerSuccessConfetti } from '@/utils/confetti';

type ConfettiProps = {
  active: boolean;
  delayMs?: number;
};

export function Confetti({ active, delayMs = 0 }: ConfettiProps) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      triggerSuccessConfetti();
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  return null;
}
