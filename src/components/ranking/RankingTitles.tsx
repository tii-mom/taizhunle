type Props = {
  heading: string;
  description: string;
  entries: string[];
};

export function RankingTitles({ heading, description, entries }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <ul className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => {
          const [title, progress, bonus] = entry.split('|');
          return (
            <li key={entry} className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4">
              <p className="text-sm font-semibold text-text-primary">{title}</p>
              <p className="text-xs uppercase tracking-wide text-text-secondary">{progress}</p>
              <p className="text-sm text-text-secondary">{bonus}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
