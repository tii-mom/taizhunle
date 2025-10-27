import { useMemo } from 'react';

type Props = {
  items: string[];
};

export function RedPacketMarquee({ items }: Props) {
  const safe = useMemo(() => items.filter(Boolean), [items]);
  const repeated = useMemo(() => safe.concat(safe), [safe]);
  if (safe.length === 0) {
    return null;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-light bg-surface-glass/60 backdrop-blur-sm">
      <div className="animate-marquee whitespace-nowrap py-3 text-sm text-text-secondary">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`} className="mx-4 inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
