import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MarketCard } from '../../services/markets';

export type TotalPoolProps = {
  markets: MarketCard[];
  onWatch: () => void;
};

export function TotalPool({ markets, onWatch }: TotalPoolProps) {
  const { t, i18n } = useTranslation('market');
  const formatter = useMemo(
    () => new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US'),
    [i18n.language],
  );
  const total = useMemo(() => markets.reduce((sum, market) => sum + market.pool, 0), [markets]);

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">{t('realtime.title')}</p>
        <p className="mt-2 text-3xl font-semibold">{formatter.format(total)} TAI</p>
        <p className="text-sm text-text-secondary">{t('realtime.subtitle', { unit: t('realtime.poolUnit') })}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onWatch} className="rounded-full border border-border px-5 py-2 text-sm">
          {t('cta.watch')}
        </button>
      </div>
    </article>
  );
}
