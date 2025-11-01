import clsx from 'clsx';
import { TrendingUp, Share2 } from 'lucide-react';

import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { GlassCard } from '../glass/GlassCard';
import { GoldenHammer } from '../glass/GoldenHammer';

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
  const { t } = useI18n('detail');
  const { mode } = useTheme();

  const numericVolume = Number(volume.replace(/[^0-9.]/g, '')) || 0;
  const hammerCount = Math.max(1, Math.round(numericVolume / 5000));
  const changeTone = trend === 'up' ? 'text-emerald-300' : 'text-rose-400';

  const statusChip = clsx(
    'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]',
    mode === 'light' ? 'border-white/40 bg-white/30 text-slate-900' : 'border-white/20 bg-white/10 text-white/90',
  );

  const trendChip = clsx(
    'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]',
    trend === 'up'
      ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200'
      : 'border-rose-400/60 bg-rose-400/15 text-rose-200',
  );

  return (
    <GlassCard className="space-y-6 p-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={statusChip}>{t(`status.${statusKey}`)}</span>
          <span className={trendChip}>{t(`trend.${trend}`)}</span>
          <GoldenHammer count={hammerCount} level={hammerCount > 8 ? 'gold' : hammerCount > 4 ? 'silver' : 'bronze'} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_18px_rgba(251,191,36,0.3)]">{title}</h1>
          <p className="mt-2 text-sm text-white/70">{description}</p>
        </div>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label={t('metrics.odds')} value={odds} />
        <Metric label={t('metrics.change')} value={change} tone={changeTone} />
        <Metric label={t('metrics.volume')} value={volume} />
        <Metric label={t('metrics.liquidity')} value={liquidity} />
      </dl>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBet}
          className="glass-button-primary inline-flex items-center gap-2"
        >
          <TrendingUp size={18} />
          {t('cta.bet')}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="glass-button-secondary inline-flex items-center gap-2"
        >
          <Share2 size={18} className="text-amber-200" />
          {t('cta.share')}
        </button>
      </div>
    </GlassCard>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="glass-card-sm space-y-2 p-4">
      <dt className="text-xs uppercase tracking-[0.35em] text-white/50">{label}</dt>
      <dd className={`font-mono text-lg font-semibold ${tone ?? 'text-amber-100'}`}>{value}</dd>
    </div>
  );
}
