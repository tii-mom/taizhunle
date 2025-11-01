/**
 * 首页 - 玻璃 DAO 控制台
 * 移动原生体验 + 交易所级实时 + 游戏机级动效
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, X } from 'lucide-react';

import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { MarketCardGlass } from '../components/glass/MarketCardGlass';
import { CreateFloatingGlass } from '../components/glass/CreateFloatingGlass';
import { RealtimeProfitBar } from '../components/glass/RealtimeProfitBar';
import { EmptyState } from '../components/common/EmptyState';
import { GoldenHammer } from '../components/glass/GoldenHammer';
import { useMarketsQuery } from '../services/markets';
import { daoPoolQuery, type DaoPoolStats } from '../queries/dao';

type GlassFilterKey = 'latest' | 'hot' | 'closing' | 'bounty' | 'following';

const FILTER_OPTIONS: Array<{ key: GlassFilterKey; label: string }> = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '最热' },
  { key: 'closing', label: '即将截止' },
  { key: 'bounty', label: '高赏金' },
  { key: 'following', label: '我的关注' },
];

export function HomeGlass() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<GlassFilterKey>('latest');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const marketsQuery = useMarketsQuery('all');
  const daoPool = useQuery(daoPoolQuery());

  const cards = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const hammerPoints = useMemo(() => cards.reduce((sum, card) => sum + card.juryCount * 12, 0), [cards]);
  const hammerLevel = hammerPoints >= 200 ? 'gold' : hammerPoints >= 50 ? 'silver' : hammerPoints >= 10 ? 'bronze' : 'gray';
  const hammerLevelText = hammerLevel === 'gold' ? '金锤' : hammerLevel === 'silver' ? '银锤' : hammerLevel === 'bronze' ? '铜锤' : '灰锤';
  const activeHammerCount = cards.filter((card) => card.juryCount > 0).length;

  const daoTotals = useMemo(() => {
    const pool = daoPool.data as DaoPoolStats | undefined;
    if (!pool) {
      return { total: 0, pending: 0 };
    }
    return Object.values(pool).reduce(
      (acc, entry) => ({
        total: acc.total + (entry.total ?? 0),
        pending: acc.pending + (entry.pending ?? 0),
      }),
      { total: 0, pending: 0 },
    );
  }, [daoPool.data]);

  const poolDelta = useMemo(() => {
    if (daoTotals.total === 0) return 0;
    const ratio = (daoTotals.pending / daoTotals.total) * 100;
    return Math.min(Math.max(ratio, -12), 24);
  }, [daoTotals]);

  const filteredCards = useMemo(() => {
    let result = [...cards];

    switch (activeFilter) {
      case 'hot':
        result.sort((a, b) => b.pool - a.pool);
        break;
      case 'closing':
        result.sort((a, b) => a.endsAt - b.endsAt);
        break;
      case 'bounty':
        result.sort((a, b) => b.bountyMultiplier - a.bountyMultiplier);
        break;
      case 'following':
        result = result.filter((card) => card.isMine);
        break;
      default:
        result.sort((a, b) => b.endsAt - a.endsAt);
        break;
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (card) =>
          card.title.toLowerCase().includes(keyword) ||
          card.entities.some((entity) => entity.toLowerCase().includes(keyword)),
      );
    }

    return result.slice(0, 4);
  }, [cards, activeFilter, searchText]);

  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [searchOpen]);

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <header className="glass-card flex items-center justify-between gap-4 p-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-slate-200/70 transition-colors duration-150 hover:border-white/20 hover:text-white"
          >
            <Search className="h-4 w-4 text-amber-200/80" />
            <span className="truncate">搜索实体、事件或关键词</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="glass-button-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            创建
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <GoldenHammer count={activeHammerCount} level={hammerLevel} />
            <div>
              <p className="text-xs font-semibold text-amber-100/80 uppercase tracking-[0.2em]">{hammerLevelText}</p>
              <p className="text-[11px] text-slate-200/70">Lv.{Math.max(1, Math.floor(hammerPoints / 25))} · {hammerPoints} pts</p>
            </div>
          </div>
        </header>

        <RealtimeProfitBar
          total={daoTotals.total}
          delta={{ value: poolDelta, intervalLabel: '24h' }}
          label="DAO 总池"
        />

        <section className="glass-card flex items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-2xl px-3 py-1 text-xs font-medium uppercase tracking-widest transition-all duration-150 ${
                  activeFilter === filter.key
                    ? 'bg-amber-300/20 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'text-slate-200/60 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className="hidden text-[11px] uppercase tracking-[0.35em] text-slate-300/50 sm:inline">
            服务端游标分页 · 20 条/页
          </span>
        </section>

        {marketsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`home-glass-skeleton-${index}`}
                className="glass-card h-36 animate-pulse rounded-3xl border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : marketsQuery.isError ? (
          <div className="glass-card p-6 text-center text-slate-200/70">
            {t('common.loadError')}
          </div>
        ) : filteredCards.length === 0 ? (
          <EmptyState type="market" />
        ) : (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <MarketCardGlass key={card.id} card={card} />
            ))}
          </div>
        )}

        <CreateFloatingGlass />
      </div>

      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-24">
          <div className="w-full max-w-xl px-4">
            <div className="glass-card space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-100">深度搜索</h2>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200/70 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search className="h-5 w-5 text-amber-200/80" />
                <input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="输入事件、项目或实体"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-300/50 focus:outline-none"
                />
              </label>
              <div className="space-y-2 text-sm text-slate-200/70">
                {filteredCards.length === 0 ? (
                  <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center text-slate-300/70">
                    暂无匹配结果，试试其他关键词
                  </p>
                ) : (
                  filteredCards.map((card) => (
                    <button
                      key={`search-result-${card.id}`}
                      type="button"
                      onClick={() => {
                        navigate(`/detail/${card.id}`);
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/10"
                    >
                      <span className="flex-1 truncate font-medium text-white">{card.title}</span>
                      <span className="text-xs uppercase tracking-widest text-amber-200/80">{card.odds}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </GlassPageLayout>
  );
}
