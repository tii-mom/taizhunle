import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import clsx from 'clsx';
import { format } from 'date-fns';

import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useMarketOddsSeries } from '@/hooks/useMarketOddsSeries';
import { useTheme } from '@/providers/ThemeProvider';

type OddsChartCardProps = {
  marketId: string;
};

type ChartDatum = {
  timestamp: number;
  yesOdds: number;
  noOdds: number;
  volume: number;
};

type OddsStats = {
  high: number;
  low: number;
};

const TOOLTIP_DATE_FORMAT = 'HH:mm';

function formatDecimal(value: number, fractionDigits = 3): string {
  if (Number.isNaN(value)) return '-';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatVolume(value: number): string {
  if (!Number.isFinite(value)) return '-';
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

type OddsTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
  active?: boolean;
};

function OddsTooltip({ active, payload, label }: OddsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) {
    return null;
  }

  const dateLabel = format(new Date(label ?? datum.timestamp), TOOLTIP_DATE_FORMAT);

  return (
    <div className="rounded-2xl border border-white/20 bg-slate-900/80 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-xl">
      <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">{dateLabel}</div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/70">YES</span>
          <span className="font-mono text-sm text-emerald-200">{formatDecimal(datum.yesOdds)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/70">NO</span>
          <span className="font-mono text-sm text-rose-200">{formatDecimal(datum.noOdds)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-white/60">
          <span>成交量</span>
          <span className="font-mono">{formatVolume(datum.volume)} TAI</span>
        </div>
      </div>
    </div>
  );
}

const tooltipContent = {
  content: OddsTooltip,
};

export function OddsChartCard({ marketId }: OddsChartCardProps) {
  const { data, isPending, isError, refetch } = useMarketOddsSeries(marketId);
  const { mode } = useTheme();
  const [track, setTrack] = useState<'yes' | 'no'>('yes');

  const chartData = useMemo<ChartDatum[]>(() => {
    if (!data?.length) return [];
    return data.map((point) => ({
      timestamp: point.timestamp,
      yesOdds: point.yesOdds,
      noOdds: point.noOdds,
      volume: point.volume,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!chartData.length) {
      return null;
    }

    const yesValues = chartData.map((point) => point.yesOdds);
    const noValues = chartData.map((point) => point.noOdds);
    const volume = chartData.reduce((sum, point) => sum + (point.volume || 0), 0);

    return {
      yes: {
        high: Math.max(...yesValues),
        low: Math.min(...yesValues),
      } satisfies OddsStats,
      no: {
        high: Math.max(...noValues),
        low: Math.min(...noValues),
      } satisfies OddsStats,
      volume,
    };
  }, [chartData]);

  const activeStats: OddsStats | null = stats ? stats[track] : null;
  const accentRing = track === 'yes' ? 'text-emerald-200 border-emerald-300/30' : 'text-rose-200 border-rose-300/30';
  const accentBg = track === 'yes' ? 'bg-emerald-500/20' : 'bg-rose-500/20';
  const axisColor = mode === 'light' ? '#1e293b' : 'rgba(255,255,255,0.55)';

  if (isError) {
    return (
      <GlassCard className="border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-white/70">
          <span>实时赔率暂时不可用</span>
          <GlassButtonGlass variant="secondary" onClick={() => refetch()}>
            重试
          </GlassButtonGlass>
        </div>
      </GlassCard>
    );
  }

  if (isPending) {
    return (
      <GlassCard className="border border-white/20 bg-white/10 backdrop-blur-2xl">
        <div className="h-[320px] animate-pulse bg-white/5" />
      </GlassCard>
    );
  }

  if (!chartData.length) {
    return (
      <GlassCard className="border border-white/20 bg-white/10 p-6 text-center text-sm text-white/60 backdrop-blur-2xl">
        暂无赔率数据，稍后再来看看
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white/90">实时赔率</h3>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">1m 更新</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
          {(['yes', 'no'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTrack(key)}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                track === key ? 'bg-white/70 text-slate-900 shadow-lg' : 'text-white/70 hover:text-white',
              )}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="yesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="noGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={mode === 'light' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(255,255,255,0.08)'} strokeDasharray="3 6" />
            <XAxis
              dataKey="timestamp"
              minTickGap={32}
              tickFormatter={(value: number) => format(new Date(value), 'HH:mm')}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
            />
            <YAxis
              domain={[0, 1]}
              width={36}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickFormatter={(value: number) => value.toFixed(2)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...tooltipContent} cursor={{ stroke: '#e2e8f0', strokeDasharray: '2 4' }} />
            <Area
              type="monotone"
              dataKey="yesOdds"
              stroke="#34d399"
              strokeWidth={track === 'yes' ? 2.6 : 1.4}
              fill="url(#yesGradient)"
              fillOpacity={track === 'yes' ? 1 : 0.4}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="noOdds"
              stroke="#f472b6"
              strokeWidth={track === 'no' ? 2.6 : 1.2}
              fill="url(#noGradient)"
              fillOpacity={track === 'no' ? 0.9 : 0.3}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 grid grid-cols-3 gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
        <div className={clsx('glass-badge flex flex-col gap-1 border-white/20 bg-white/5 px-4 py-3', accentRing)}>
          <span className="text-[10px] text-white/50">24h 高</span>
          <span className="font-mono text-base text-white">{activeStats ? formatDecimal(activeStats.high, 4) : '-'}</span>
        </div>
        <div className={clsx('glass-badge flex flex-col gap-1 border-white/20 bg-white/5 px-4 py-3', accentRing)}>
          <span className="text-[10px] text-white/50">24h 低</span>
          <span className="font-mono text-base text-white">{activeStats ? formatDecimal(activeStats.low, 4) : '-'}</span>
        </div>
        <div className={clsx('glass-badge flex flex-col gap-1 border-white/20 bg-white/5 px-4 py-3', accentBg)}>
          <span className="text-[10px] text-white/60">成交量</span>
          <span className="font-mono text-base text-white">{stats ? `${formatVolume(stats.volume)} TAI` : '-'}</span>
        </div>
      </footer>
    </GlassCard>
  );
}
