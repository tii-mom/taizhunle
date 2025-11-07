/**
 * 数字滚动动画组件
 */
import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  end: number;
  duration?: number;
  className?: string;
  decimals?: number;
  suffix?: string;
};

export function CountUp({ end, duration = 1000, className = '', decimals = 0, suffix = '' }: CountUpProps) {
  const [count, setCount] = useState(0);
  const previousValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const change = end - startValue;

    if (change === 0) {
      setCount(end);
      previousValueRef.current = end;
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      const currentValue = startValue + change * easeOutQuad;

      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        previousValueRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      previousValueRef.current = end;
      frameRef.current = null;
    };
  }, [end, duration]);

  return (
    <span className={className}>
      {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  );
}
