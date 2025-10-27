type Props = {
  filters: string[];
  active: string;
  onSelect: (value: string) => void;
};

export function AvatarFilters({ filters, active, onSelect }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{filters[0] ?? ''}</h2>
        <p className="text-sm text-text-secondary">{filters[1] ?? ''}</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {filters.slice(2).map((filter) => {
          const [key, label] = filter.split('|');
          const isActive = key === active;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelect(key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${isActive ? 'border-accent bg-accent text-accent-contrast' : 'border-border text-text-secondary'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
