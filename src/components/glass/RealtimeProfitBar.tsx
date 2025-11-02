/**
 * 实时收益滚动条
 */
import { CountUp } from './CountUp';
import { useTheme } from '@/providers/ThemeProvider';

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
  const { mode } = useTheme();
  const isLight = mode === 'light';

  return (
    <div
      className={`glass-card relative overflow-hidden rounded-3xl p-4 ${
        isLight ? 'border-slate-900/10 bg-white/90' : 'border-white/20 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.02]'
      }`}
    >
      <div className="absolute inset-0 translate-y-6 select-none opacity-30 blur-3xl">
        <div
          className={`h-full w-full bg-gradient-to-r ${
            isLight ? 'from-amber-200/40 via-amber-300/20 to-transparent' : 'from-amber-300/20 via-amber-500/10 to-amber-300/0'
          }`}
        />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className={`text-[11px] uppercase tracking-[0.35em] ${isLight ? 'text-slate-600' : 'text-slate-200/60'}`}>
            {label}
          </p>
          <div className="flex items-end gap-2">
            <CountUp
              end={total}
              duration={1200}
              className={`font-mono text-2xl font-semibold drop-shadow-[0_0_12px_rgba(251,191,36,0.4)] sm:text-3xl ${
                isLight ? 'text-amber-500' : 'text-amber-200'
              }`}
            />
            <span className={`pb-1 text-sm font-medium ${isLight ? 'text-amber-500' : 'text-amber-100/80'}`}>TAI</span>
          </div>
        </div>
        {delta ? (
          <div
            className={`flex flex-col items-end rounded-2xl border px-3 py-2 text-xs ${
              isLight
                ? isPositive
                  ? 'border-emerald-600/20 bg-emerald-100/80 text-emerald-700'
                  : 'border-rose-600/20 bg-rose-100/80 text-rose-700'
                : isPositive
                  ? 'border-white/10 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/10 bg-rose-500/10 text-rose-200'
            }`}
          >
            <span className="font-semibold leading-4">
              {isPositive ? '+' : ''}
              {delta.value.toFixed(2)}%
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest ${
                isLight ? 'text-slate-600' : 'text-white/60'
              }`}
            >
              {delta.intervalLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
