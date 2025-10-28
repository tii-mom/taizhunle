import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Share2, Download, Send } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useHaptic } from '../../hooks/useHaptic';
import { useAssetTrend, type TrendGranularity } from '../../hooks/useAssetTrend';
import { formatNumber } from '../../utils/format';

export function AssetTrendDashboard() {
  const { t } = useTranslation('assets');
  const { vibrate } = useHaptic();
  const [granularity, setGranularity] = useState<TrendGranularity>('day');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { data: trendData, isLoading } = useAssetTrend({ granularity });

  const animatedHigh = useCountUp(trendData.high);
  const animatedLow = useCountUp(trendData.low);
  const animatedProfit = useCountUp(trendData.profit);

  // 切换时间范围
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

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const value = payload[0].value;
    const isPositive = value >= trendData.low;

    return (
      <div className="rounded-lg border border-border-light bg-surface-glass/95 px-3 py-2 shadow-xl backdrop-blur-md">
        <p className="text-xs text-text-secondary">{payload[0].payload.label}</p>
        <p className={`font-mono text-sm font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
          {formatNumber(value, 2)}
        </p>
      </div>
    );
  };

  // 分享功能
  const handleShareTelegram = () => {
    vibrate(10);
    const text = `${t('trend.forecastProfit')}: +${formatNumber(trendData.profit, 2)}\n${t('trend.high')}: ${formatNumber(trendData.high, 2)}\n${t('trend.low')}: ${formatNumber(trendData.low, 2)}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleShareX = () => {
    vibrate(10);
    const text = `${t('trend.forecastProfit')}: +${formatNumber(trendData.profit, 2)}\n${t('trend.high')}: ${formatNumber(trendData.high, 2)}\n${t('trend.low')}: ${formatNumber(trendData.low, 2)}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleDownloadImage = () => {
    vibrate(10);
    window.alert(t('downloadSuccess'));
    setShowShareMenu(false);
  };

  // 渐变定义
  const gradientId = `areaGradient-${granularity}`;

  return (
    <div className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md" aria-label="Asset trend chart">
      {/* 加载进度条 */}
      {isLoading && (
        <div className="absolute left-0 right-0 top-0 h-0.5 overflow-hidden rounded-t-2xl">
          <div className="h-full w-full animate-pulse bg-accent/60" style={{ animation: 'pulse 0.8s ease-in-out infinite' }} />
        </div>
      )}

      {/* 数据指标 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('trend.high')}</p>
          <p className="font-mono text-sm font-semibold text-text-primary">{formatNumber(animatedHigh, 2)}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('trend.low')}</p>
          <p className="font-mono text-sm font-semibold text-text-primary">{formatNumber(animatedLow, 2)}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('trend.forecastProfit')}</p>
          <p className="font-mono text-sm font-semibold text-success">+{formatNumber(animatedProfit, 2)}</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div
        className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ height: window.innerWidth < 768 ? '200px' : '260px' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData.data} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgb(var(--color-border))" 
              strokeOpacity={0.15}
              horizontal={true} 
              vertical={false} 
            />
            <XAxis 
              dataKey="label" 
              hide
            />
            <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ 
                stroke: 'rgb(var(--color-accent))', 
                strokeWidth: 2, 
                strokeDasharray: '5 5',
                strokeOpacity: 0.3
              }} 
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgb(var(--color-accent))"
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 7,
                fill: 'rgb(var(--color-accent))',
                stroke: 'rgb(var(--color-background))',
                strokeWidth: 3,
              }}
              isAnimationActive={!isTransitioning}
              animationDuration={400}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 时间粒度切换 + 分享按钮 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 justify-center gap-2 overflow-x-auto">
          {(['hour', 'day', 'week', 'month'] as TrendGranularity[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => handleGranularityChange(range)}
              className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                granularity === range ? 'text-accent' : 'text-text-secondary hover:text-accent'
              }`}
              style={{
                textShadow: granularity === range ? '0 0 8px rgb(var(--color-accent))' : 'none',
              }}
            >
              {t(`trend.${range}`)}
              {granularity === range && (
                <span
                  className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-accent"
                  style={{
                    boxShadow: '0 0 8px rgb(var(--color-accent))',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 分享按钮 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              vibrate();
              setShowShareMenu(!showShareMenu);
            }}
            className="rounded-lg border border-border-light bg-surface-glass/60 p-2 backdrop-blur-md transition-all hover:bg-surface-hover active:scale-95"
          >
            <Share2 size={18} className="text-accent" />
          </button>

          {/* 分享菜单 */}
          {showShareMenu && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-10 mt-2 w-48 space-y-1 rounded-xl border border-border-light bg-surface-glass/95 p-2 shadow-2xl backdrop-blur-md duration-200">
              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-all hover:bg-surface-hover active:scale-95"
              >
                <Send size={16} className="text-[#0088cc]" />
                {t('shareToTelegram')}
              </button>
              <button
                type="button"
                onClick={handleShareX}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-all hover:bg-surface-hover active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {t('shareToX')}
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-all hover:bg-surface-hover active:scale-95"
              >
                <Download size={16} className="text-accent" />
                {t('downloadImage')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
