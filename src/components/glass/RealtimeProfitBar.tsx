/**
 * 实时收益滚动条
 */
import { CountUp } from './CountUp';

type RealtimeProfitBarProps = {
  total: number;
  label?: string;
  delta?: {
    value: number;
    intervalLabel: string;
  };
};

export function RealtimeProfitBar({ total, label = 'DAO 总池', delta }: RealtimeProfitBarProps) {
  const isPositive = delta ? delta.value >= 0 : true;

  return (
    <div className="glass-card relative overflow-hidden rounded-3xl border-white/20 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.02] p-4">
      <div className="absolute inset-0 translate-y-6 select-none opacity-30 blur-3xl">
        <div className="h-full w-full bg-gradient-to-r from-amber-300/20 via-amber-500/10 to-amber-300/0" />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-200/60">{label}</p>
          <div className="flex items-end gap-2">
            <CountUp end={total} duration={1200} className="font-mono text-2xl font-semibold text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)] sm:text-3xl" />
            <span className="pb-1 text-sm font-medium text-amber-100/80">TAI</span>
          </div>
        </div>
        {delta ? (
          <div className={`flex flex-col items-end rounded-2xl border border-white/10 px-3 py-2 text-xs ${
            isPositive ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'
          }`}
          >
            <span className="font-semibold leading-4">
              {isPositive ? '+' : ''}
              {delta.value.toFixed(2)}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/60">{delta.intervalLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
