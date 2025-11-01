/**
 * 倒计时组件
 */
import { useEffect, useState } from 'react';

type CountDownProps = {
  endTime: number;
  className?: string;
};

export function CountDown({ endTime, className }: CountDownProps) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = minutes < 5;

  if (timeLeft <= 0) {
    const base = 'font-mono text-sm text-gray-400';
    const cls = className ? `${base} ${className}` : base;
    return <span className={cls}>已结束</span>;
  }

  return (
    <span
      className={(() => {
        const base = 'font-mono text-sm font-bold';
        const tone = isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-400';
        const combined = `${base} ${tone}`;
        return className ? `${combined} ${className}` : combined;
      })()}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
