import { History, AlertCircle } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { useHaptic } from '../../hooks/useHaptic';

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
  const { vibrate } = useHaptic();

  const handleAppeal = () => {
    vibrate(10);
    onAppeal();
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <History size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        </div>
        <button 
          type="button" 
          onClick={handleAppeal} 
          className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-sm text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          <AlertCircle size={16} className="text-accent" />
          {appealLabel}
        </button>
      </header>
      {records.length === 0 ? (
        <EmptyState type="profile" />
      ) : (
        <div className="space-y-3">
          <header className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary backdrop-blur-md">
            <span>{columns[0] ?? ''}</span>
            <span>{columns[1] ?? ''}</span>
            <span>{columns[2] ?? ''}</span>
            <span>{columns[3] ?? ''}</span>
          </header>
          <ul className="space-y-2">
            {records.map((item, index) => (
              <li 
                key={item.id} 
                className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-[2fr,1fr,1fr,1fr] items-center gap-4 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 text-sm backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="font-medium text-text-primary">{item.title}</span>
                <span className="font-mono text-text-secondary">{item.amount}</span>
                <span className="text-text-secondary">{item.status}</span>
                <span className="text-xs text-text-secondary">{item.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
