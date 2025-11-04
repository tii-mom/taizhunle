import { useMemo } from 'react';

import { CountDown } from './CountDown';
import { CountUp } from './CountUp';
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
  const showCelebration = useMemo(() => data.juryReward >= data.pool * 0.02, [data.juryReward, data.pool]);

  const panelTone = isLight
    ? 'border-slate-200/80 bg-white/85 text-slate-800 shadow-[0_26px_42px_-34px_rgba(15,23,42,0.28)]'
    : 'border-white/10 bg-white/5 text-slate-200/80';
  const labelTone = isLight ? 'text-slate-500' : 'text-slate-200/60';
  const bodyTone = isLight ? 'text-slate-700' : 'text-slate-200/70';
  const oddsTone = isLight ? 'text-emerald-600' : 'text-emerald-200';
  const countdownTone = isLight ? 'text-amber-600' : 'text-amber-100';
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
        <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent px-6 py-4 text-right shadow-[0_26px_42px_-36px_rgba(16,185,129,0.6)]">
          <p className={`text-[11px] uppercase tracking-[0.35em] ${labelTone}`}>{t('glass.odds')}</p>
          <div className="mt-3 flex items-end justify-end gap-6">
            <div className="text-right">
              <p className={`text-[10px] uppercase tracking-[0.35em] ${labelTone}`}>{t('market:yes')}</p>
              <span className={`font-mono text-4xl font-semibold ${oddsTone}`}>{data.yesOdds.toFixed(2)}x</span>
            </div>
            <div className="h-12 w-px bg-emerald-400/30" />
            <div className="text-right">
              <p className={`text-[10px] uppercase tracking-[0.35em] ${labelTone}`}>{t('market:no')}</p>
              <span className={`font-mono text-4xl font-semibold ${isLight ? 'text-teal-700' : 'text-teal-100'}`}>{data.noOdds.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* 奖池信息 */}
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

        {/* 陪审员奖励（突出显示）*/}
        <div className={`rounded-3xl border p-5 ${isLight ? 'border-amber-300/60 bg-gradient-to-br from-amber-50/90 to-white/85 shadow-[0_26px_42px_-34px_rgba(251,191,36,0.35)]' : 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-white/5'}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <p className={`text-[11px] uppercase tracking-[0.35em] ${isLight ? 'text-amber-700' : 'text-amber-200/80'}`}>
              {t('glass.juryReward')}
            </p>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <CountUp
              end={data.juryReward}
              duration={1200}
              className={`font-mono text-2xl font-semibold ${isLight ? 'text-amber-700' : 'text-amber-200'}`}
            />
            <span className={`pb-1 text-sm ${isLight ? 'text-amber-600' : 'text-amber-100/80'}`}>TAI</span>
          </div>
          <div className={`mt-5 grid grid-cols-2 gap-3 text-sm ${isLight ? 'text-slate-700' : 'text-slate-200/80'}`}>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.juryCount')}</p>
              <span className={`font-mono text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.juryCount}</span>
              <span className={`ml-1 text-xs ${labelTone}`}>{t('glass.jurors')}</span>
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${labelTone}`}>{t('glass.perJuror')}</p>
              <span className={`font-mono text-xl ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>
                {data.rewardPerJuror.toLocaleString()}
              </span>
            </div>
          </div>
          <div className={`mt-3 text-[10px] ${isLight ? 'text-amber-600/70' : 'text-amber-200/60'}`}>
            {t('glass.juryNote')}
          </div>
        </div>
      </div>

      <Confetti active={showCelebration} delayMs={250} />
    </article>
  );
}
