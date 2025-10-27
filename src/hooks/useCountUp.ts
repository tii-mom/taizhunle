import { useEffect, useRef, useState } from 'react';

const ANIMATION_DURATION = 300;

export function useCountUp(target: number, duration: number = ANIMATION_DURATION) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(target);

  useEffect(() => {
    if (startValueRef.current === target) {
      return;
    }

    const startValue = startValueRef.current;
    startValueRef.current = target;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const nextValue = startValue + (target - startValue) * easeOutQuad;

      setCurrent(nextValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return current;
}
