/**
 * 倒计时组件
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CountDownProps = {
  endTime: number;
  className?: string;
};

export function CountDown({ endTime, className }: CountDownProps) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());
  const { t } = useTranslation('common');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const { minutes, seconds, isUrgent } = useMemo(() => {
    const remainingMinutes = Math.floor(timeLeft / 60000);
    const remainingSeconds = Math.floor((timeLeft % 60000) / 1000);
    return {
      minutes: remainingMinutes,
      seconds: remainingSeconds,
      isUrgent: remainingMinutes < 5,
    };
  }, [timeLeft]);

  if (timeLeft <= 0) {
    const base = 'font-mono text-sm text-gray-400';
    const cls = className ? `${base} ${className}` : base;
    return <span className={cls}>{t('countdown.ended')}</span>;
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
