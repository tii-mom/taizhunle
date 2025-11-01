import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles } from 'lucide-react';

import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { GlassCard } from '../components/glass/GlassCard';
import { RealtimeProfitBar } from '../components/glass/RealtimeProfitBar';
import { MarketCardGlass } from '../components/glass/MarketCardGlass';
import { EmptyState } from '../components/common/EmptyState';
import { useMarketsQuery } from '../services/markets';
import { daoPoolQuery, type DaoPoolStats } from '../queries/dao';

export function SearchGlass() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const marketsQuery = useMarketsQuery('all');
  const daoPool = useQuery(daoPoolQuery());

  const cards = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const daoTotals = useMemo(() => {
    const pool = daoPool.data as DaoPoolStats | undefined;
    if (!pool) return { total: 0, pending: 0 };
    return Object.values(pool).reduce(
      (acc, entry) => ({
        total: acc.total + (entry.total ?? 0),
        pending: acc.pending + (entry.pending ?? 0),
      }),
      { total: 0, pending: 0 },
    );
  }, [daoPool.data]);

  const filteredCards = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return cards.slice(0, 6);
    return cards.filter(
      (card) =>
        card.title.toLowerCase().includes(trimmed) ||
        card.entities.some((entity) => entity.toLowerCase().includes(trimmed)),
    );
  }, [cards, keyword]);

  const poolDelta = useMemo(() => {
    if (daoTotals.total === 0) return 0;
    const ratio = (daoTotals.pending / daoTotals.total) * 100;
    return Math.min(Math.max(ratio, -12), 24);
  }, [daoTotals]);

  const popularKeywords = useMemo(
    () => ['BTC', 'TON 生态', '高赏金', '陪审团', '今日热点'],
    [],
  );

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Search className="h-5 w-5 text-amber-200/80" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('search.placeholder', '输入事件、实体或关键词')}
              className="glass-input border-0 bg-transparent px-0 py-0 text-base"
            />
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="glass-button-ghost text-xs"
            >
              {t('common.clear', '清除')}
            </button>
          </div>
          {showSuggestions ? (
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => setKeyword(word)}
                  className="glass-chip hover:border-amber-200/60 hover:text-amber-50"
                >
                  {word}
                </button>
              ))}
            </div>
          ) : null}
        </GlassCard>

        <RealtimeProfitBar total={daoTotals.total} delta={{ value: poolDelta, intervalLabel: '24h' }} label={t('search.daoPool', 'DAO 总池')} />

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="glass-section-title">{t('search.results', '实时市场')}</p>
              <p className="mt-1 text-sm text-white/60">{t('search.hint', '实时拉取 20 条，输入关键字可精确定位')}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="glass-button-secondary"
            >
              <Sparkles className="h-4 w-4" />
              {showSuggestions ? t('search.hideSuggest', '隐藏推荐') : t('search.showSuggest', '显示推荐')}
            </button>
          </div>
        </GlassCard>

        {marketsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`search-skeleton-${index}`} className="glass-card h-32 animate-pulse border-white/5 bg-white/[0.04]" />
            ))}
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
      </div>
    </GlassPageLayout>
  );
}
