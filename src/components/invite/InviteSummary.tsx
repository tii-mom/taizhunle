type Props = {
  stats: string[];
  code: string;
  buttonLabel: string;
  onCopy: () => void;
};

export function InviteSummary({ stats, code, buttonLabel, onCopy }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[0] ?? ''}</p>
          <h2 className="text-2xl font-semibold text-text-primary">{stats[1] ?? ''}</h2>
        </div>
        <button type="button" onClick={onCopy} className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary">
          {buttonLabel}
        </button>
      </header>
      <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{stats[2] ?? ''}</p>
        <p className="mt-1 text-lg font-semibold text-text-primary">{code}</p>
        <p className="mt-1">{stats[3] ?? ''}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {stats.slice(4).map((item) => (
          <article key={item} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-text-secondary">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}
