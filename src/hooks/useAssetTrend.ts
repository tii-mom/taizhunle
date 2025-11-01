import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type TrendGranularity = 'hour' | 'day' | 'week' | 'month';

export type TrendDataPoint = {
  label: string;
  value: number | null;
  timestamp: Date;
};

export type TrendData = {
  high: number;
  low: number;
  profit: number;
  data: TrendDataPoint[];
};

type UseAssetTrendParams = {
  granularity: TrendGranularity;
};

// 线性插值函数
function interpolateValue(prev: number | null, next: number | null, ratio: number): number {
  if (prev !== null && next !== null) {
    return prev + (next - prev) * ratio;
  }
  if (prev !== null) return prev;
  if (next !== null) return next;
  return 12000; // 默认值
}

// 填充 null 值
function fillNullValues(data: TrendDataPoint[]): TrendDataPoint[] {
  const result = [...data];
  
  for (let i = 0; i < result.length; i++) {
    if (result[i].value === null) {
      // 找到前一个非 null 值
      let prevIndex = i - 1;
      while (prevIndex >= 0 && result[prevIndex].value === null) {
        prevIndex--;
      }
      
      // 找到后一个非 null 值
      let nextIndex = i + 1;
      while (nextIndex < result.length && result[nextIndex].value === null) {
        nextIndex++;
      }
      
      const prevValue = prevIndex >= 0 ? result[prevIndex].value : null;
      const nextValue = nextIndex < result.length ? result[nextIndex].value : null;
      
      const ratio = prevIndex >= 0 && nextIndex < result.length ? 
        (i - prevIndex) / (nextIndex - prevIndex) : 0.5;
      
      result[i].value = interpolateValue(prevValue, nextValue, ratio);
    }
  }
  
  return result;
}

function getISOWeekNumber(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function useAssetTrend({ granularity }: UseAssetTrendParams) {
  const { i18n } = useTranslation('assets');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 生成时间标签和数据点
  const trendData = useMemo((): TrendData => {
    const now = new Date();
    const data: TrendDataPoint[] = [];
    const isZh = i18n.language.startsWith('zh');

    switch (granularity) {
      case 'hour': {
        // 过去 24 小时，每 4h 1 点 → 6 点（更流畅）
        for (let i = 5; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
          const hour = timestamp.getHours();
          
          data.push({
            label: `${hour.toString().padStart(2, '0')}:00`,
            value: 12000 + Math.random() * 500 - 250,
            timestamp,
          });
        }
        break;
      }

      case 'day': {
        const dayNames = isZh
          ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayName = dayNames[timestamp.getDay()];

          data.push({
            label: dayName,
            value: 12000 + Math.random() * 800 - 400,
            timestamp,
          });
        }
        break;
      }

      case 'week': {
        for (let i = 6; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          let label: string;

          if (isZh) {
            label = i === 0 ? '本周' : i === 1 ? '上周' : `第${getISOWeekNumber(timestamp)}周`;
          } else {
            label = i === 0 ? 'This wk' : i === 1 ? 'Last wk' : `W${getISOWeekNumber(timestamp)}`;
          }

          data.push({
            label,
            value: 12000 + Math.random() * 1200 - 600,
            timestamp,
          });
        }
        break;
      }

      case 'month': {
        const monthFormatter = new Intl.DateTimeFormat(i18n.language, {
          month: isZh ? 'numeric' : 'short',
        });
        for (let i = 5; i >= 0; i--) {
          const timestamp = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const formatted = monthFormatter.format(timestamp);
          const monthName = isZh ? (formatted.endsWith('月') ? formatted : `${formatted}月`) : formatted;

          data.push({
            label: monthName,
            value: 12000 + Math.random() * 2000 - 1000,
            timestamp,
          });
        }
        break;
      }
    }

    // 填充 null 值（模拟后端数据不足的情况）
    const filledData = fillNullValues(data);

    // 计算统计数据
    const values = filledData.map(d => d.value!).filter(v => v !== null);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const profit = values[values.length - 1] - values[0];

    return {
      high,
      low,
      profit,
      data: filledData,
    };
  }, [granularity, i18n.language]);

  // 模拟数据拉取
  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    const interval = setInterval(refetch, 30000); // 30s
    return () => clearInterval(interval);
  }, [granularity]);

  return {
    data: trendData,
    isLoading,
    error,
    refetch,
  };
}
