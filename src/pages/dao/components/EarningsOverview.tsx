import clsx from 'clsx';

import { GlassCard } from '@/components/glass/GlassCard';
import { CountUp } from '@/components/glass/CountUp';
import { useI18n } from '@/hooks/useI18n';

export type EarningsOverviewProps = {
  totalPooled: number;
  pending: number;
  today: number;
  last7Days: number;
  reserve: number;
};

export function EarningsOverview({ totalPooled, pending, today, last7Days, reserve }: EarningsOverviewProps) {
  const { t } = useI18n('dao');

  return (
    <GlassCard className="grid gap-4 p-6 lg:grid-cols-3">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{t('earnings.totalPool')}</p>
        <span className="font-mono text-3xl font-semibold text-white drop-shadow-[0_0_20px_rgba(0,212,255,0.4)]">
          <CountUp end={totalPooled} /> TAI
        </span>
        <p className="text-sm text-slate-300/70">{t('earnings.totalPoolHint')}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_36px_-32px_rgba(56,189,248,0.35)]">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">{t('earnings.pending')}</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-emerald-200">
          <CountUp end={pending} /> TAI
        </p>
        <p className="mt-3 text-xs text-slate-300/70">{t('earnings.pendingHint')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricPill label={t('earnings.today')} value={today} tone="cyan" />
        <MetricPill label={t('earnings.week')} value={last7Days} tone="violet" />
        <MetricPill label={t('earnings.reserve')} value={reserve} tone="amber" className="sm:col-span-2" />
      </div>
    </GlassCard>
  );
}

type MetricPillProps = {
  label: string;
  value: number;
  tone: 'cyan' | 'violet' | 'amber';
  className?: string;
};

function MetricPill({ label, value, tone, className }: MetricPillProps) {
  const palette = {
    cyan: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-[0_16px_30px_-24px_rgba(6,182,212,0.45)]',
    violet: 'border-violet-300/40 bg-violet-400/10 text-violet-100 shadow-[0_16px_30px_-24px_rgba(139,92,246,0.45)]',
    amber: 'border-amber-300/40 bg-amber-400/10 text-amber-100 shadow-[0_16px_30px_-24px_rgba(251,191,36,0.45)]',
  } as const;

  return (
    <div className={clsx('rounded-2xl border px-4 py-3', palette[tone], className)}>
      <p className="text-xs uppercase tracking-[0.35em] text-white/80">{label}</p>
      <p className="mt-2 font-mono text-lg font-semibold text-white">
        <CountUp end={value} /> TAI
      </p>
    </div>
  );
}
