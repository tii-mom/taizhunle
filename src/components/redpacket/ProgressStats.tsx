import { useCountUp } from '../../hooks/useCountUp';
import { formatTAI } from '../../utils/format';

type Props = {
  soldTAI: number;
  totalTAI: number;
  label: string;
};

export function ProgressStats({ soldTAI, totalTAI, label }: Props) {
  const animatedSold = useCountUp(soldTAI);
  const percentage = Math.min(100, (soldTAI / totalTAI) * 100);

  return (
    <div className="space-y-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary">
          {formatTAI(animatedSold)} / {formatTAI(totalTAI)} TAI
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-background/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-right font-mono text-sm font-semibold text-accent">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
}
