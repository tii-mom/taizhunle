import { useCountDown } from '../../hooks/useCountDown';

type Props = {
  targetTimestamp: number;
  label: string;
  className?: string;
};

export function CountdownBar({ targetTimestamp, label, className = '' }: Props) {
  const { formatted, isExpired } = useCountDown(targetTimestamp);

  return (
    <div className={`space-y-2 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-lg font-semibold text-text-primary">
          {isExpired ? '00:00:00' : formatted}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-background/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-1000"
          style={{
            width: isExpired ? '0%' : '100%',
          }}
        />
      </div>
    </div>
  );
}
