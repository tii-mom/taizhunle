import { Trophy } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

type Props = {
  heading: string;
  updatedAt: string;
  columns: string[];
  entries: string[];
  empty: string;
};

export function RankingLive({ heading, updatedAt, columns, entries, empty: _empty }: Props) {
  const getRankIcon = (rank: string) => {
    const rankNum = parseInt(rank);
    if (rankNum === 1) return '🥇';
    if (rankNum === 2) return '🥈';
    if (rankNum === 3) return '🥉';
    return null;
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-text-secondary">{updatedAt}</p>
        </div>
      </header>
      {entries.length === 0 ? (
        <EmptyState type="market" />
      ) : (
        <div className="space-y-3">
          <header className="grid grid-cols-[0.5fr,2fr,1fr,1fr] gap-4 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary backdrop-blur-md">
            <span>{columns[0] ?? ''}</span>
            <span>{columns[1] ?? ''}</span>
            <span>{columns[2] ?? ''}</span>
            <span>{columns[3] ?? ''}</span>
          </header>
          <ul className="space-y-2">
            {entries.map((item, index) => {
              const [rank, name, score, delta] = item.split('|');
              const rankIcon = getRankIcon(rank);
              return (
                <li 
                  key={item} 
                  className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-[0.5fr,2fr,1fr,1fr] items-center gap-4 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 text-sm backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="flex items-center gap-1 font-mono font-semibold text-text-primary">
                    {rankIcon && <span className="text-lg">{rankIcon}</span>}
                    {rank}
                  </span>
                  <span className="font-medium text-text-primary">{name}</span>
                  <span className="font-mono text-text-secondary">{score}</span>
                  <span className={`font-mono font-semibold ${delta.startsWith('+') ? 'text-success' : delta.startsWith('-') ? 'text-error' : 'text-text-secondary'}`}>
                    {delta}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
