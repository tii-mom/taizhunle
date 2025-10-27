import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type Props = {
  statusKey: string;
  trend: 'up' | 'down';
  title: string;
  description: string;
  odds: string;
  change: string;
  volume: string;
  liquidity: string;
  onBet: () => void;
  onShare: () => void;
};

export function DetailSummary({ statusKey, trend, title, description, odds, change, volume, liquidity, onBet, onShare }: Props) {
  const { t } = useTranslation('detail');
  return (
    <section className="space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-2 text-text-secondary">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide">
          <span className="rounded-full border border-border px-3 py-1 text-text-primary">{t(`status.${statusKey}`)}</span>
          <span className={clsx('rounded-full border px-3 py-1', trend === 'up' ? 'border-success text-success' : 'border-warning text-warning')}>
            {t(`trend.${trend}`)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
        <p>{description}</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t('metrics.odds', { value: odds })} value={odds} />
        <Metric label={t('metrics.change', { value: change })} value={change} highlight={trend === 'up' ? 'success' : 'warning'} />
        <Metric label={t('metrics.volume', { value: volume })} value={volume} />
        <Metric label={t('metrics.liquidity', { value: liquidity })} value={liquidity} />
      </dl>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBet} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
          {t('cta.bet')}
        </button>
        <button type="button" onClick={onShare} className="rounded-full border border-border px-6 py-3 text-sm text-text-secondary">
          {t('cta.share')}
        </button>
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
  highlight?: 'success' | 'warning';
};

function Metric({ label, value, highlight }: MetricProps) {
  const tone = highlight === 'success' ? 'text-success' : highlight === 'warning' ? 'text-warning' : 'text-text-primary';
  return (
    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className={clsx('text-lg font-semibold', tone)}>{value}</dd>
    </div>
  );
}
