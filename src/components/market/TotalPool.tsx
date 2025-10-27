import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import type { MarketCard } from '../../services/markets';
import { useCountUp } from '../../hooks/useCountUp';
import { usePulseGlow } from '../../hooks/usePulseGlow';

export type TotalPoolProps = {
  markets: MarketCard[];
  onWatch: () => void;
};

export function TotalPool({ markets, onWatch }: TotalPoolProps) {
  const { t, i18n } = useTranslation('market');
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );
  const total = useMemo(() => markets.reduce((sum, market) => sum + market.pool, 0), [markets]);
  const animatedTotal = useCountUp(total);
  const shouldGlow = usePulseGlow(total);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">{t('realtime.title')}</p>
        <p className={`mt-2 font-mono text-3xl font-semibold text-accent shadow-accent/50 xs:text-4xl ${shouldGlow ? 'animate-pulse-glow' : ''}`}>
          {formatter.format(animatedTotal)} TAI
        </p>
        <p className="text-sm text-text-secondary">{t('realtime.subtitle', { unit: t('realtime.poolUnit') })}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onWatch}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
        >
          <Eye size={20} className="text-accent" />
          {t('cta.watch')}
        </button>
      </div>
    </article>
  );
}
