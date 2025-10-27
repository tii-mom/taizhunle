import { Zap } from 'lucide-react';

type Props = {
  active: boolean;
  normalRate: number;
  accelerateRate: number;
  timeRange: string;
};

export function AccelerateBadge({ active, normalRate, accelerateRate, timeRange }: Props) {
  if (!active) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 backdrop-blur-sm">
      <Zap className="h-4 w-4 text-accent" />
      <span className="text-sm font-medium text-accent">
        {normalRate}% → {accelerateRate}% ({timeRange})
      </span>
    </div>
  );
}
