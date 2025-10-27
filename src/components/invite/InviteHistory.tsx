import { EmptyState } from '../common/EmptyState';

type RecordItem = {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
};

type Props = {
  heading: string;
  columns: string[];
  empty: string;
  records: RecordItem[];
  appealLabel: string;
  onAppeal: () => void;
};

export function InviteHistory({ heading, columns, empty: _empty, records, appealLabel, onAppeal }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <button type="button" onClick={onAppeal} className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-transform active:scale-95">
          {appealLabel}
        </button>
      </header>
      {records.length === 0 ? (
        <EmptyState type="profile" />
      ) : (
        <div className="space-y-3">
          <header className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary">
            <span>{columns[0] ?? ''}</span>
            <span>{columns[1] ?? ''}</span>
            <span>{columns[2] ?? ''}</span>
            <span>{columns[3] ?? ''}</span>
          </header>
          <ul className="space-y-2">
            {records.map((item) => (
              <li key={item.id} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 rounded-2xl border border-border/40 bg-background/40 px-4 py-3 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{item.title}</span>
                <span>{item.amount}</span>
                <span>{item.status}</span>
                <span>{item.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
