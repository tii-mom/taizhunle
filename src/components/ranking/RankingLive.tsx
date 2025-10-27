type Props = {
  heading: string;
  updatedAt: string;
  columns: string[];
  entries: string[];
  empty: string;
};

export function RankingLive({ heading, updatedAt, columns, entries, empty }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
          <p className="text-xs uppercase tracking-wide text-text-secondary">{updatedAt}</p>
        </div>
      </header>
      {entries.length === 0 ? (
        <p className="rounded-2xl border border-border/60 bg-background/40 px-4 py-6 text-center text-sm text-text-secondary">{empty}</p>
      ) : (
        <div className="space-y-3">
          <header className="grid grid-cols-[0.5fr,2fr,1fr,1fr] gap-4 rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary">
            <span>{columns[0] ?? ''}</span>
            <span>{columns[1] ?? ''}</span>
            <span>{columns[2] ?? ''}</span>
            <span>{columns[3] ?? ''}</span>
          </header>
          <ul className="space-y-2">
            {entries.map((item) => {
              const [rank, name, score, delta] = item.split('|');
              return (
                <li key={item} className="grid grid-cols-[0.5fr,2fr,1fr,1fr] items-center gap-4 rounded-2xl border border-border/40 bg-background/40 px-4 py-3 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">{rank}</span>
                  <span className="text-text-primary">{name}</span>
                  <span>{score}</span>
                  <span className={delta.startsWith('+') ? 'text-success' : delta.startsWith('-') ? 'text-danger' : 'text-text-secondary'}>{delta}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
