import { useMemo } from 'react';

import { CountDown } from './CountDown';
import { CountUp } from './CountUp';
import { GoldenHammer } from './GoldenHammer';
import { Confetti } from './Confetti';
import type { MarketSystemInfo } from '@/queries/marketDetail';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

type SystemInfoGlassProps = {
  data: MarketSystemInfo;
};

export function SystemInfoGlass({ data }: SystemInfoGlassProps) {
  const { t } = useI18n('market');
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const showCelebration = useMemo(() => data.bountyMultiplier >= 2.4, [data.bountyMultiplier]);

  const panelTone = isLight
    ? 'border-slate-200/80 bg-white/85 text-slate-800 shadow-[0_26px_42px_-34px_rgba(15,23,42,0.28)]'
    : 'border-white/10 bg-white/5 text-slate-200/80';
  const labelTone = isLight ? 'text-slate-500' : 'text-slate-200/60';
  const bodyTone = isLight ? 'text-slate-700' : 'text-slate-200/70';
  const oddsTone = isLight ? 'text-emerald-600' : 'text-emerald-200';
  const countdownTone = isLight ? 'text-amber-600' : 'text-amber-100';
  const bountyTone = isLight ? 'text-amber-700' : 'text-amber-100';
  const valueTone = isLight ? 'text-slate-900' : 'text-white';

  return (
    <article className="glass-card overflow-hidden p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
              isLight
                ? 'border-amber-400/40 bg-amber-100/80 text-amber-700'
                : 'border-amber-400/30 bg-amber-500/10 text-amber-100/80'
            }`}
          >
            {t('glass.badge')}
          </span>
          <h1
            className={`text-2xl font-semibold ${valueTone} drop-shadow-[0_0_22px_rgba(251,191,36,0.32)] md:text-3xl`}
          >
            {data.title}
          </h1>
          <p className={`max-w-2xl text-sm leading-relaxed ${bodyTone}`}>{data.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-[11px] uppercase tracking-[0.35em] ${labelTone}`}>{t('glass.odds')}</p>
            <span className={`font-mono text-3xl font-semibold ${oddsTone}`}>{data.odds}</span>
          </div>
          <GoldenHammer count={data.juryCount} level={data.juryCount >= 5 ? 'gold' : data.juryCount >= 3 ? 'silver' : data.juryCount > 0 ? 'bronze' : 'gray'} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className={`rounded-3xl border p-5 ${panelTone}`}>
          <p className={`text-[11px] uppercase tracking-[0.35em] ${labelTone}`}>{t('glass.pool')}</p>
          <div className="mt-3 flex items-end gap-2">
            <CountUp
              end={data.pool}
              duration={1200}
              className={`font-mono text-3xl font-semibold ${isLight ? 'text-amber-600' : 'text-amber-200'}`}
            />
            <span className={`pb-1 text-sm ${isLight ? 'text-amber-600' : 'text-amber-100/80'}`}>TAI</span>
          </div>
          <div className={`mt-5 grid grid-cols-2 gap-3 text-sm ${isLight ? 'text-slate-700' : 'text-slate-200/80'}`}>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.participants')}</p>
              <CountUp end={data.participants} duration={900} className={`font-mono text-xl ${isLight ? 'text-slate-900' : ''}`} />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.countdown')}</p>
              <CountDown endTime={data.endTime} className={`font-mono text-base ${countdownTone}`} />
            </div>
          </div>
        </div>
        <div className={`rounded-3xl border p-5 ${panelTone}`}>
          <p className={`text-[11px] uppercase tracking-[0.35em] ${labelTone}`}>{t('glass.liquidity')}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className={`font-mono text-2xl font-semibold ${isLight ? 'text-cyan-600' : 'text-cyan-200'}`}>{data.liquidity}</span>
          </div>
          <div className={`mt-5 grid grid-cols-2 gap-3 text-sm ${isLight ? 'text-slate-700' : 'text-slate-200/80'}`}>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.volume')}</p>
              <span className={`font-mono text-xl ${isLight ? 'text-slate-800' : ''}`}>{data.volume}</span>
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.bounty')}</p>
              <span className={`font-mono text-xl ${bountyTone}`}>x{data.bountyMultiplier.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <Confetti active={showCelebration} delayMs={250} />
    </article>
  );
}
