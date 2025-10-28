import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Share2 } from 'lucide-react';

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
    <section className="space-y-6 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide">
          <span className="rounded-full border border-border-light bg-surface-glass/60 px-3 py-1 text-text-primary backdrop-blur-md">{t(`status.${statusKey}`)}</span>
          <span className={clsx('rounded-full border backdrop-blur-md px-3 py-1', trend === 'up' ? 'border-success/50 bg-success/10 text-success' : 'border-warning/50 bg-warning/10 text-warning')}>
            {t(`trend.${trend}`)}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
        <p className="text-text-secondary">{description}</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t('metrics.odds', { value: odds })} value={odds} />
        <Metric label={t('metrics.change', { value: change })} value={change} highlight={trend === 'up' ? 'success' : 'warning'} />
        <Metric label={t('metrics.volume', { value: volume })} value={volume} />
        <Metric label={t('metrics.liquidity', { value: liquidity })} value={liquidity} />
      </dl>
      <div className="flex flex-wrap gap-3">
        <button 
          type="button" 
          onClick={onBet} 
          className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-lg transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          <TrendingUp size={20} />
          {t('cta.bet')}
        </button>
        <button 
          type="button" 
          onClick={onShare} 
          className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 px-6 py-3 text-sm text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          <Share2 size={20} className="text-accent" />
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
  const tone = highlight === 'success' ? 'text-success' : highlight === 'warning' ? 'text-warning' : 'text-accent';
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md duration-200">
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className={clsx('font-mono text-lg font-semibold', tone)}>{value}</dd>
    </div>
  );
}
