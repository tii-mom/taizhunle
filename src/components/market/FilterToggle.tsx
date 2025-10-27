import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { MarketFilter } from '../../services/markets';

type FilterToggleProps = {
  value: MarketFilter;
  onChange: (value: MarketFilter) => void;
};

const FILTER_KEYS: MarketFilter[] = ['all', 'live', 'closed', 'my'];

export function FilterToggle({ value, onChange }: FilterToggleProps) {
  const { t } = useTranslation('market');
  const labels = useMemo(
    () => (t('filters', { returnObjects: true }) as string[] | undefined) ?? FILTER_KEYS,
    [t],
  );

  return (
    <div className="inline-flex rounded-full border border-border bg-background p-1">
      {FILTER_KEYS.map((key, index) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            value === key ? 'bg-surface text-text-primary shadow-surface' : 'text-text-secondary'
          }`}
        >
          {labels[index] ?? key}
        </button>
      ))}
    </div>
  );
}

