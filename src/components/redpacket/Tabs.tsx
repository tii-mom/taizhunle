import clsx from 'clsx';

type Tab<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onSelect: (key: T) => void;
};

export function RedPacketTabs<T extends string>({ tabs, active, onSelect }: Props<T>) {
  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={clsx(
            'rounded-full border px-4 py-2 text-sm transition-colors',
            tab.key === active ? 'border-accent bg-accent text-accent-contrast' : 'border-border text-text-secondary',
          )}
          onClick={() => onSelect(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
