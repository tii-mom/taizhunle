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

  const { display, isUrgent } = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const padded = (value: number) => String(value).padStart(2, '0');

    let text: string;
    if (days > 0) {
      const remainingHours = hours % 24;
      text = `${days}d ${padded(remainingHours)}:${padded(minutes % 60)}:${padded(seconds)}`;
    } else if (hours > 0) {
      text = `${padded(hours)}:${padded(minutes % 60)}:${padded(seconds)}`;
    } else {
      text = `${padded(minutes)}:${padded(seconds)}`;
    }

    return {
      display: text,
      isUrgent: minutes < 5,
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
      {display}
    </span>
  );
}
