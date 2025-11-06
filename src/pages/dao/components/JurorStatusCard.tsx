import { Info } from 'lucide-react';

import { GlassCard } from '@/components/glass/GlassCard';
import { CountUp } from '@/components/glass/CountUp';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';

const STAT_PILL_TONE = {
  cyan: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100',
  emerald: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100',
  violet: 'border-violet-300/40 bg-violet-400/10 text-violet-100',
  amber: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
} as const;

export type JurorStatus = {
  levelKey: 'normal' | 'l1' | 'l2' | 'l3' | 'l4';
  levelName: string;
  points: number;
  nextLevelPoints: number;
  stakeAmount: number;
  accuracy: number;
  dailyLimit: number | null;
  dailyUsed: number;
  weight: number;
  perCasePoints: number;
};

type JurorStatusCardProps = {
  status: JurorStatus;
  onStake: () => void;
  onWithdraw: () => void;
  onVerify: () => void;
  onShowRules: () => void;
};

export function JurorStatusCard({ status, onStake, onWithdraw, onVerify, onShowRules }: JurorStatusCardProps) {
  const { t } = useI18n('dao');
  const progress = Math.min((status.points / Math.max(status.nextLevelPoints, 1)) * 100, 100);
  const remainingLabel = status.dailyLimit === null
    ? t('status.remainingUnlimited')
    : `${Math.max(status.dailyLimit - status.dailyUsed, 0)}/${status.dailyLimit} ${t('status.times')}`;

  return (
    <GlassCard className="grid gap-6 p-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white drop-shadow-[0_0_16px_rgba(0,212,255,0.35)]">
              {status.levelName}
            </h2>
            <GlassButtonGlass
              type="button"
              onClick={onVerify}
              className="!rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-rose-400/20 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-100 backdrop-blur hover:border-amber-200/80 hover:shadow-[0_18px_42px_-24px_rgba(251,191,36,0.55)]"
            >
              {t('status.actions.verify')}
            </GlassButtonGlass>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
              <span className="text-slate-200/70">{status.points} / {status.nextLevelPoints}</span>
            </span>
            <button
              type="button"
              onClick={onShowRules}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/15"
              aria-label={t('jurorSystem.title')}
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300/70">{t('status.points')}</span>
            <span className="font-mono text-lg text-white">
              <CountUp end={status.points} />
              <span className="text-sm text-slate-300/70"> / {status.nextLevelPoints}</span>
            </span>
          </div>
          <div className="glass-progress h-2">
            <div className="glass-progress-value" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatPill label={t('status.stake')} value={`${status.stakeAmount.toLocaleString()} TAI`} tone="cyan" />
          <StatPill label={t('status.accuracy')} value={`${status.accuracy.toFixed(1)}%`} tone="emerald" />
          <StatPill label={t('status.remaining')} value={remainingLabel} tone="violet" />
          <StatPill label={t('status.weight')} value={`x${status.weight.toFixed(2)}`} tone="amber" />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="space-y-4 text-sm text-slate-100/80">
          <div className="flex items-center justify-between">
            <span>{t('status.perCasePoints')}</span>
            <span className="font-mono text-lg text-emerald-200">+{status.perCasePoints.toFixed(1)}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300/70">
            {t('status.description')}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <GlassButtonGlass
            className="!rounded-xl !bg-gradient-to-r !from-cyan-400 !to-emerald-400 !text-slate-900 hover:shadow-[0_18px_38px_-24px_rgba(16,185,129,0.55)]"
            onClick={onStake}
          >
            {t('status.actions.stakeMore')}
          </GlassButtonGlass>
          <GlassButtonGlass
            variant="ghost"
            className="!rounded-xl border border-white/20 bg-white/5 hover:border-rose-300/60 hover:bg-rose-500/10"
            onClick={onWithdraw}
          >
            {t('status.actions.exit')}
          </GlassButtonGlass>
        </div>
      </div>
    </GlassCard>
  );
}

type StatPillProps = {
  label: string;
  value: string;
  tone: keyof typeof STAT_PILL_TONE;
};

function StatPill({ label, value, tone }: StatPillProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${STAT_PILL_TONE[tone]}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-white/70">{label}</p>
      <p className="mt-2 font-mono text-base font-semibold text-white">{value}</p>
    </div>
  );
}
