import clsx from 'clsx';

import { useI18n } from '@/hooks/useI18n';

export type JurorRewardBadgeProps = {
  reward: number;
  className?: string;
};

export function JurorRewardBadge({ reward, className }: JurorRewardBadgeProps) {
  const { t } = useI18n('dao');
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-emerald-200 shadow-[0_18px_36px_-30px_rgba(16,185,129,0.45)]',
        className,
      )}
    >
      {t('createLimits.reward.title')}: {reward.toLocaleString()} TAI
    </span>
  );
}
