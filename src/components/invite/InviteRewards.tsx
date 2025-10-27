type Props = {
  tiers: string[];
  highlight: string;
  note: string;
};

export function InviteRewards({ tiers, highlight, note }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{highlight}</h2>
        <span className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary">{note}</span>
      </header>
      <ul className="grid gap-3 md:grid-cols-3">
        {tiers.map((tier) => (
          <li key={tier} className="space-y-1 rounded-2xl border border-border/60 bg-background/40 p-4">
            <p className="text-sm text-text-secondary">{tier.split('|')[0]}</p>
            <p className="text-lg font-semibold text-text-primary">{tier.split('|')[1]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
