import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Activity, Download, Send, Share2 } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatNumber } from '../../utils/format';
import { useHaptic } from '../../hooks/useHaptic';

type TimeRange = 'hour' | 'day' | 'week' | 'month';
type Currency = 'TAI' | 'USDT';

type ChartData = {
  labels: string[];
  values: number[];
  change: number;
  high: number;
  low: number;
  profit: number; // 预测收益
};

export function AssetChart() {
  const { t } = useTranslation('assets');
  const { vibrate } = useHaptic();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [currency, setCurrency] = useState<Currency>('TAI');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Mock data - 实际项目中应该从 API 获取
  const chartData: Record<TimeRange, Record<Currency, ChartData>> = useMemo(
    () => ({
      hour: {
        TAI: {
          labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
          values: [12000, 12050, 12100, 12080, 12150, 12120, 12200, 12180, 12250, 12300, 12280, 12345],
          change: 2.88,
          high: 12350,
          low: 12000,
          profit: 567.8,
        },
        USDT: {
          labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
          values: [14800, 14850, 14900, 14880, 14950, 14920, 15000, 14980, 15050, 15100, 15080, 15234],
          change: 2.93,
          high: 15250,
          low: 14800,
          profit: 701.2,
        },
      },
      day: {
        TAI: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          values: [12000, 12150, 12080, 12300, 12450, 12280, 12345],
          change: 2.88,
          high: 12500,
          low: 11980,
          profit: 1234.5,
        },
        USDT: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          values: [14800, 14950, 14880, 15180, 15360, 15150, 15234],
          change: 2.93,
          high: 15420,
          low: 14760,
          profit: 1523.4,
        },
      },
      week: {
        TAI: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [11500, 11800, 12000, 12200, 12100, 12300, 12345],
          change: 7.35,
          high: 12500,
          low: 11400,
          profit: 5678.9,
        },
        USDT: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [14200, 14550, 14800, 15050, 14920, 15180, 15234],
          change: 7.28,
          high: 15420,
          low: 14100,
          profit: 7012.3,
        },
      },
      month: {
        TAI: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [10800, 11200, 11800, 12345],
          change: 14.31,
          high: 12600,
          low: 10500,
          profit: 23456.7,
        },
        USDT: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [13320, 13824, 14564, 15234],
          change: 14.37,
          high: 15550,
          low: 12950,
          profit: 28901.2,
        },
      },
    }),
    [],
  );

  const currentData = chartData[timeRange][currency];
  const isPositive = currentData.change >= 0;
  const animatedChange = useCountUp(currentData.change);
  const animatedHigh = useCountUp(currentData.high);
  const animatedLow = useCountUp(currentData.low);
  const animatedProfit = useCountUp(currentData.profit);

  // 计算图表路径和点位
  const { chartPath, points } = useMemo(() => {
    const { values } = currentData;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const width = 100;
    const height = 60;
    const step = width / (values.length - 1);

    const calculatedPoints = values.map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return { x, y, value, label: currentData.labels[index] };
    });

    const pathString = `M ${calculatedPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`;

    return { chartPath: pathString, points: calculatedPoints };
  }, [currentData]);

  // 处理图表点击/触摸
  const handleChartInteraction = useCallback(
    (event: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      if (!chartRef.current) return;

      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const x = ((clientX - rect.left) / rect.width) * 100;

      // 找到最近的点
      let closestIndex = 0;
      let minDistance = Infinity;

      points.forEach((point, index) => {
        const distance = Math.abs(point.x - x);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (minDistance < 10) {
        // 10% 容差
        vibrate(5);
        setHoveredPoint(closestIndex);
      }
    },
    [points, vibrate],
  );

  const handleShareTelegram = () => {
    vibrate(10);
    const text = `${t('assetTrend')}: ${isPositive ? '+' : ''}${formatNumber(currentData.change, 2)}%\n${t('profit')}: ${formatNumber(currentData.profit, 2)} ${currency}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleShareX = () => {
    vibrate(10);
    const text = `${t('assetTrend')}: ${isPositive ? '+' : ''}${formatNumber(currentData.change, 2)}%\n${t('profit')}: ${formatNumber(currentData.profit, 2)} ${currency}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleDownloadImage = async () => {
    vibrate(10);
    // 实际项目中应该使用 html2canvas 或类似库生成图片
    window.alert(t('downloadSuccess'));
    setShowShareMenu(false);
  };

  const hoveredData = hoveredPoint !== null ? points[hoveredPoint] : null;

  return (
    <div ref={chartRef} className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-text-primary">{t('assetTrend')}</h2>
          <div className="flex items-center gap-1">
            {isPositive ? <TrendingUp size={16} className="text-success" /> : <TrendingDown size={16} className="text-error" />}
            <span className={`font-mono text-sm font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
              {isPositive ? '+' : ''}
              {formatNumber(animatedChange, 2)}%
            </span>
          </div>
        </div>

        {/* Share Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              vibrate();
              setShowShareMenu(!showShareMenu);
            }}
            className="rounded-lg border border-border-light bg-surface-glass/60 p-2 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
          >
            <Share2 size={18} className="text-accent" />
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-12 z-10 w-48 space-y-1 rounded-xl border border-border-light bg-surface-glass/95 p-2 shadow-2xl backdrop-blur-md duration-200">
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

      {/* Currency Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            vibrate();
            setCurrency('TAI');
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            currency === 'TAI' ? 'bg-accent text-accent-contrast shadow-lg' : 'border border-border-light bg-surface-glass/60 text-text-secondary hover:text-text-primary'
          }`}
        >
          TAI
        </button>
        <button
          type="button"
          onClick={() => {
            vibrate();
            setCurrency('USDT');
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            currency === 'USDT' ? 'bg-accent text-accent-contrast shadow-lg' : 'border border-border-light bg-surface-glass/60 text-text-secondary hover:text-text-primary'
          }`}
        >
          USDT
        </button>
      </div>

      {/* Chart */}
      <div className="relative h-48 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        {/* Hover Tooltip */}
        {hoveredData && (
          <div
            className="animate-in fade-in zoom-in-95 absolute z-10 rounded-lg border border-border-light bg-surface-glass/95 px-3 py-2 shadow-xl backdrop-blur-md duration-100"
            style={{
              left: `${hoveredData.x}%`,
              top: `${hoveredData.y - 10}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="text-xs text-text-secondary">{hoveredData.label}</p>
            <p className="font-mono text-sm font-semibold text-text-primary">{formatNumber(hoveredData.value, 2)}</p>
          </div>
        )}

        <svg
          viewBox="0 0 100 60"
          className="h-full w-full cursor-crosshair"
          preserveAspectRatio="none"
          onClick={handleChartInteraction}
          onTouchStart={handleChartInteraction}
          onMouseMove={handleChartInteraction}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className={isPositive ? 'text-success' : 'text-error'} />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={isPositive ? 'text-success' : 'text-error'} />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d={`${chartPath} L 100,60 L 0,60 Z`} fill="url(#chartGradient)" />

          {/* Line */}
          <path d={chartPath} fill="none" stroke="currentColor" strokeWidth="2" className={isPositive ? 'text-success' : 'text-error'} />

          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? 4 : 2}
              fill="currentColor"
              className={`transition-all ${hoveredPoint === index ? 'text-accent' : isPositive ? 'text-success' : 'text-error'}`}
            />
          ))}
        </svg>
      </div>

      {/* Time Range Toggle */}
      <div className="grid grid-cols-4 gap-2">
        {(['hour', 'day', 'week', 'month'] as TimeRange[]).map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => {
              vibrate();
              setTimeRange(range);
              setHoveredPoint(null);
            }}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              timeRange === range
                ? 'bg-accent/20 text-accent ring-1 ring-accent/50'
                : 'border border-border-light bg-surface-glass/60 text-text-secondary hover:text-text-primary'
            }`}
          >
            {t(range)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('high')}</p>
          <p className="font-mono text-sm font-semibold text-text-primary">{formatNumber(animatedHigh, 2)}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('low')}</p>
          <p className="font-mono text-sm font-semibold text-text-primary">{formatNumber(animatedLow, 2)}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-1 text-xs text-text-secondary">{t('profit')}</p>
          <p className="font-mono text-sm font-semibold text-success">+{formatNumber(animatedProfit, 2)}</p>
        </div>
      </div>
    </div>
  );
}
