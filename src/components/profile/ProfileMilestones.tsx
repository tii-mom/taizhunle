type Props = {
  heading: string;
  labels: string[];
  progress: number;
  target: number;
  emptyState: string;
  achievements: string[];
};

export function ProfileMilestones({ heading, labels, progress, target, emptyState, achievements }: Props) {
  const completion = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{labels[0] ?? ''}</p>
      </header>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-background/60">
          <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} role="progressbar" />
        </div>
        <p className="text-xs uppercase tracking-wide text-text-secondary">{labels[1] ?? ''}</p>
        <p className="text-sm text-text-secondary">{labels[2] ? labels[2].replace('{{value}}', `${completion}%`) : `${completion}%`}</p>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{labels[3] ?? ''}</h3>
        {achievements.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-text-secondary">{emptyState}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {achievements.map((item) => (
              <li key={item} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
