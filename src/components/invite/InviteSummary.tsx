import { Copy } from 'lucide-react';

type Props = {
  stats: string[];
  code: string;
  buttonLabel: string;
  onCopy: () => void;
};

export function InviteSummary({ stats, code, buttonLabel, onCopy }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[0] ?? ''}</p>
          <h2 className="font-mono text-2xl font-semibold text-accent shadow-accent/30">{stats[1] ?? ''}</h2>
        </div>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-transform active:scale-95">
          <Copy size={16} className="text-accent" />
          {buttonLabel}
        </button>
      </header>
      <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[2] ?? ''}</p>
        <p className="mt-1 font-mono text-lg font-semibold text-text-primary">{code}</p>
        <p className="mt-1">{stats[3] ?? ''}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {stats.slice(4).map((item) => (
          <article key={item} className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border/60 bg-background/40 px-4 py-3 font-mono text-sm text-text-secondary duration-200">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}
