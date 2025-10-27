type Props = {
  name: string;
  level: string;
  exp: string;
  nextLevel: string;
  streak: string;
};

export function ProfileHeader({ name, level, exp, nextLevel, streak }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">{level}</p>
          <h2 className="text-2xl font-semibold text-text-primary">{name}</h2>
        </div>
        <span className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary">{streak}</span>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <Stat label={exp.split('|')[0] ?? ''} value={exp.split('|')[1] ?? ''} />
        <Stat label={nextLevel.split('|')[0] ?? ''} value={nextLevel.split('|')[1] ?? ''} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
