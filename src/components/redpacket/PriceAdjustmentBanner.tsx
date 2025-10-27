import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPercentage } from '../../utils/format';

type Props = {
  adjustment: number;
  className?: string;
};

export function PriceAdjustmentBanner({ adjustment, className = '' }: Props) {
  if (adjustment === 0) {
    return null;
  }

  const isPositive = adjustment > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  const bgClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
  const borderClass = isPositive ? 'border-green-500/30' : 'border-red-500/30';

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <div className="flex-1">
          <p className={`font-mono text-lg font-semibold ${colorClass}`}>
            {formatPercentage(adjustment)}
          </p>
          <p className="text-sm text-text-secondary">
            {isPositive ? 'Price increased due to high demand' : 'Price decreased to boost sales'}
          </p>
        </div>
      </div>
    </div>
  );
}
