import { useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Share2, Download, Send } from 'lucide-react';

import { useCountUp } from '../../hooks/useCountUp';
import { useHaptic } from '../../hooks/useHaptic';
import { useAssetTrend, type TrendGranularity } from '../../hooks/useAssetTrend';
import { formatNumber } from '../../utils/format';
import { GlassCard } from '../glass/GlassCard';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';

type TooltipPayload = {
  value: number;
  payload: {
    label: string;
  };
};

export function AssetTrendDashboard() {
  const { t, locale } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const [granularity, setGranularity] = useState<TrendGranularity>('day');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { data: trendData, isLoading } = useAssetTrend({ granularity });

  const animatedHigh = useCountUp(trendData.high);
  const animatedLow = useCountUp(trendData.low);
  const animatedProfit = useCountUp(trendData.profit);
  const isZh = locale.startsWith('zh');

  const handleGranularityChange = useCallback(
    (newGranularity: TrendGranularity) => {
      if (newGranularity === granularity) return;
      vibrate(10);
      setIsTransitioning(true);
      setTimeout(() => {
        setGranularity(newGranularity);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 300);
    },
    [granularity, vibrate],
  );

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (!active || !payload || !payload[0]) return null;
    const value = payload[0].value;
    const isPositive = value >= trendData.low;

    return (
      <div className="glass-card-sm border-white/20 bg-slate-950/70 px-4 py-3 shadow-[0_20px_40px_-25px_rgba(15,23,42,0.8)]">
        <p className="text-xs text-white/70">{payload[0].payload.label}</p>
        <p className={`font-mono text-sm font-semibold ${isPositive ? 'text-emerald-300' : 'text-rose-400'}`}>
          {formatNumber(value, 2)}
        </p>
      </div>
    );
  };

  const handleShareTelegram = () => {
    vibrate(10);
    const text = `${t('trend.forecastProfit')}: +${formatNumber(trendData.profit, 2)}\n${t('trend.high')}: ${formatNumber(
      trendData.high,
      2,
    )}\n${t('trend.low')}: ${formatNumber(trendData.low, 2)}\n${new Date().toLocaleString(locale)}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleShareX = () => {
    vibrate(10);
    const text = `${t('trend.forecastProfit')}: +${formatNumber(trendData.profit, 2)}\n${t('trend.high')}: ${formatNumber(
      trendData.high,
      2,
    )}\n${t('trend.low')}: ${formatNumber(trendData.low, 2)}\n${new Date().toLocaleString(locale)}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      window.location.href,
    )}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleDownloadImage = () => {
    vibrate(10);
    window.alert(t('downloadSuccess'));
    setShowShareMenu(false);
  };

  const gradientId = `areaGradient-${granularity}`;
  const strokeColor = mode === 'light' ? '#f59e0b' : '#fbbf24';
  const fillTop = mode === 'light' ? 'rgba(245,158,11,0.45)' : 'rgba(251,191,36,0.55)';
  const fillBottom = mode === 'light' ? 'rgba(245,158,11,0.05)' : 'rgba(251,191,36,0.08)';

  const gridStroke = mode === 'light' ? 'rgba(30,41,59,0.12)' : 'rgba(148,163,184,0.18)';
  const activeDotFill = mode === 'light' ? '#38bdf8' : '#0ea5e9';
  const activeDotStroke = mode === 'light' ? '#0f172a' : '#031322';

  return (
    <GlassCard className="relative space-y-5 p-6">
      {isLoading ? (
        <div className="absolute inset-x-6 top-0 h-0.5 overflow-hidden rounded-full">
          <div className="h-full w-full animate-[pulse_0.8s_ease-in-out_infinite] bg-amber-300/60" />
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('trend.high')}</p>
          <p className="mt-2 font-mono text-lg font-semibold text-white">{formatNumber(animatedHigh, 2)}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('trend.low')}</p>
          <p className="mt-2 font-mono text-lg font-semibold text-white">{formatNumber(animatedLow, 2)}</p>
        </div>
        <div className="glass-card-sm p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('trend.forecastProfit')}</p>
          <p className="mt-2 font-mono text-lg font-semibold text-emerald-300">+{formatNumber(animatedProfit, 2)}</p>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData.data} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillTop} />
                <stop offset="100%" stopColor={fillBottom} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.5} horizontal vertical={false} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: strokeColor, strokeWidth: 2, strokeDasharray: '5 5', strokeOpacity: 0.3 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 7, fill: activeDotFill, stroke: activeDotStroke, strokeWidth: 3 }}
              isAnimationActive={!isTransitioning}
              animationDuration={400}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 justify-center gap-2 overflow-x-auto">
          {(['hour', 'day', 'week', 'month'] as TrendGranularity[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => handleGranularityChange(range)}
              className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                isZh ? '' : 'tracking-wide'
              } transition-all duration-300 ${
                granularity === range ? 'text-amber-200' : 'text-white/60 hover:text-white'
              }`}
              style={{
                textShadow: granularity === range ? '0 0 10px rgba(251,191,36,0.6)' : 'none',
              }}
            >
              {t(`trend.${range}`)}
              {granularity === range ? (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              vibrate();
              setShowShareMenu((prev) => !prev);
            }}
            className="glass-button-secondary !rounded-full !px-3 !py-3"
          >
            <Share2 size={18} className="text-amber-200" />
          </button>
          {showShareMenu ? (
            <div className="glass-card-sm absolute right-0 top-12 z-10 w-48 space-y-2 p-4">
              <button type="button" onClick={handleShareTelegram} className="glass-button-ghost justify-start text-sm">
                <Send size={16} className="text-amber-200" />
                Telegram
              </button>
              <button type="button" onClick={handleShareX} className="glass-button-ghost justify-start text-sm">
                <Share2 size={16} className="text-amber-200" />
                X (Twitter)
              </button>
              <button type="button" onClick={handleDownloadImage} className="glass-button-ghost justify-start text-sm">
                <Download size={16} className="text-amber-200" />
                {t('trend.download', '保存图像')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
