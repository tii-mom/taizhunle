import { Trophy, RefreshCw } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import type { RankingEntry, RankingType } from '../../services/rankingService';

type Props = {
  heading: string;
  updatedAt: string;
  columns: string[] | Record<string, string[]>;
  entries: RankingEntry[];
  empty: string;
  loading?: boolean;
  rankingType: RankingType;
};

export function RankingLive({ heading, updatedAt, columns, entries, loading, rankingType }: Props) {
  const getTypeColor = (type: RankingType) => {
    switch (type) {
      case 'invite':
        return '#10B981';
      case 'whale':
        return '#F59E0B';
      case 'prophet':
        return '#8B5CF6';
      default:
        return '#10B981';
    }
  };

  const color = getTypeColor(rankingType);
  
  // 获取当前类型的列名
  const currentColumns = Array.isArray(columns) ? columns : (columns[rankingType] || columns.invite);
  
  // 渲染第三列内容（根据类型不同）
  const renderScoreColumn = (entry: RankingEntry) => {
    switch (rankingType) {
      case 'invite':
        return `${entry.inviteEarnings?.toLocaleString() ?? 0} TAI`;
      case 'whale':
        return `${entry.predictionEarnings?.toLocaleString() ?? 0} TAI`;
      case 'prophet':
        return `${entry.predictions ?? 0} / ${entry.accuracy ?? 0}%`;
      default:
        return entry.score.toLocaleString();
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <Trophy size={20} style={{ color }} />
            <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{updatedAt}</p>
            {loading && <RefreshCw size={12} className="animate-spin text-text-secondary" />}
          </div>
        </div>
        
        <div className="rounded-full border border-border-light bg-surface-glass/60 px-3 py-1 backdrop-blur-md">
          <span className="text-xs font-medium text-text-secondary">前 50 名 / Top 50</span>
        </div>
      </header>
      
      {entries.length === 0 ? (
        <EmptyState type="market" />
      ) : (
        <div className="space-y-3">
          <header className="grid grid-cols-[0.5fr,2fr,1fr,1fr] gap-4 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary backdrop-blur-md">
            <span>{currentColumns[0] ?? ''}</span>
            <span>{currentColumns[1] ?? ''}</span>
            <span>{currentColumns[2] ?? ''}</span>
            <span>{currentColumns[3] ?? ''}</span>
          </header>
          
          <ul className="space-y-2 max-h-[600px] overflow-y-auto">
            {entries.slice(0, 50).map((entry, index) => {
              const isTop3 = entry.rank <= 3;
              return (
                <li 
                  key={entry.userId} 
                  className={`animate-in fade-in slide-in-from-bottom-2 grid grid-cols-[0.5fr,2fr,1fr,1fr] items-center gap-4 rounded-xl border px-4 py-3 text-sm backdrop-blur-md transition-all duration-200 ${
                    isTop3 
                      ? 'border-[#F59E0B]/30 bg-gradient-to-r from-[#F59E0B]/10 to-surface-glass/60 hover:ring-2 hover:ring-[#F59E0B]/50' 
                      : 'border-border-light bg-surface-glass/60 hover:ring-2 hover:ring-accent/50'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="flex items-center gap-1 font-mono font-semibold text-text-primary">
                    {entry.badge && <span className="text-lg">{entry.badge}</span>}
                    {entry.rank}
                  </span>
                  <span className={`font-medium ${isTop3 ? 'text-[#F59E0B]' : 'text-text-primary'}`}>
                    {entry.username}
                  </span>
                  <span className="font-mono text-text-secondary">{renderScoreColumn(entry)}</span>
                  <span className={`font-mono font-semibold ${entry.delta > 0 ? 'text-[#10B981]' : entry.delta < 0 ? 'text-[#EF4444]' : 'text-text-secondary'}`}>
                    {entry.delta > 0 ? '+' : ''}{entry.delta}
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
