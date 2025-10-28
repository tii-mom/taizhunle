import { Copy } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';

type Props = {
  stats: string[];
  code: string;
  buttonLabel: string;
  onCopy: () => void;
};

export function InviteSummary({ stats, code, buttonLabel, onCopy }: Props) {
  const { vibrate } = useHaptic();

  const handleCopy = () => {
    vibrate(10);
    onCopy();
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[0] ?? ''}</p>
          <h2 className="font-mono text-3xl font-bold text-accent shadow-accent/50 dark:shadow-accent/30">{stats[1] ?? ''}</h2>
        </div>
        <button 
          type="button" 
          onClick={handleCopy} 
          className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-sm text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          <Copy size={16} className="text-accent" />
          {buttonLabel}
        </button>
      </header>
      <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[2] ?? ''}</p>
        <p className="mt-2 font-mono text-lg font-semibold text-text-primary">{code}</p>
        <p className="mt-2 text-sm text-text-secondary">{stats[3] ?? ''}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {stats.slice(4).map((item) => (
          <article 
            key={item} 
            className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 font-mono text-sm text-text-primary backdrop-blur-md duration-200"
          >
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}
