import { Gift } from 'lucide-react';

type Props = {
  tiers: string[];
  highlight: string;
  note: string;
};

export function InviteRewards({ tiers, highlight, note }: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Gift size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-text-primary">{highlight}</h2>
        </div>
        <span className="rounded-full border border-border-light bg-surface-glass/60 px-4 py-2 text-sm text-text-secondary backdrop-blur-md">{note}</span>
      </header>
      <ul className="grid gap-3 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <li 
            key={tier} 
            className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <p className="text-xs uppercase tracking-wide text-text-secondary">{tier.split('|')[0]}</p>
            <p className="font-mono text-lg font-semibold text-accent">{tier.split('|')[1]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
