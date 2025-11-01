import { Trophy, RefreshCw } from 'lucide-react';

import { EmptyState } from '../common/EmptyState';
import type { RankingEntry, RankingType } from '../../services/rankingService';
import { GlassCard } from '../glass/GlassCard';

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
    <GlassCard className="space-y-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy size={20} style={{ color }} />
            <h2 className="text-xl font-semibold text-white">{heading}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <p className="uppercase tracking-[0.3em]">{updatedAt}</p>
            {loading ? <RefreshCw size={12} className="animate-spin" /> : null}
          </div>
        </div>

        <div className="glass-chip border-white/15 bg-white/5 text-white/70">
          前 50 名 · Top 50
        </div>
      </header>

      {entries.length === 0 ? (
        <EmptyState type="market" />
      ) : (
        <div className="space-y-3">
          <header className="glass-card-sm grid grid-cols-[0.5fr,2fr,1fr,1fr] gap-4 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
            <span>{currentColumns[0] ?? ''}</span>
            <span>{currentColumns[1] ?? ''}</span>
            <span>{currentColumns[2] ?? ''}</span>
            <span>{currentColumns[3] ?? ''}</span>
          </header>

          <ul className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
            {entries.slice(0, 50).map((entry, index) => {
              const isTop3 = entry.rank <= 3;
              return (
                <li
                  key={entry.userId}
                  className={`glass-card-sm grid grid-cols-[0.5fr,2fr,1fr,1fr] items-center gap-4 px-4 py-3 text-sm transition-all duration-200 ${
                    isTop3
                      ? 'border-amber-200/40 bg-gradient-to-r from-amber-400/15 via-white/5 to-transparent'
                      : 'hover:border-amber-200/30'
                  } animate-in fade-in slide-in-from-bottom-2`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="flex items-center gap-1 font-mono font-semibold text-white">
                    {entry.badge ? <span className="text-lg">{entry.badge}</span> : null}
                    {entry.rank}
                  </span>
                  <span className={`font-medium ${isTop3 ? 'text-amber-200' : 'text-white'}`}>{entry.username}</span>
                  <span className="font-mono text-white/60">{renderScoreColumn(entry)}</span>
                  <span
                    className={`font-mono font-semibold ${
                      entry.delta > 0 ? 'text-emerald-300' : entry.delta < 0 ? 'text-rose-400' : 'text-white/60'
                    }`}
                  >
                    {entry.delta > 0 ? '+' : ''}
                    {entry.delta}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
