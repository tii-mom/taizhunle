import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Star } from 'lucide-react';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { MarketCardGlass } from '@/components/glass/MarketCardGlass';
import { CreateFloatingGlass } from '@/components/glass/CreateFloatingGlass';
import { RealtimeProfitBar } from '@/components/glass/RealtimeProfitBar';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import type { MarketCard, MarketSortKey } from '@/services/markets';
import { useMarketsQuery } from '@/services/markets';
import { HOME_PAGE_LIMIT, homePageQuery, type HomeFeedPage } from '@/queries/homePage';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { AuroraPanel } from '@/components/glass/AuroraPanel';
import { HomeTopBar } from '@/components/home/HomeTopBar';

type StatusFilterKey = 'all' | 'live' | 'closing' | 'closed';
type PoolFilterKey = 'any' | 'under10k' | 'mid' | 'over50k';
type TemplateFilterKey = 'any' | 'coin' | 'macro' | 'sports';

type DualLabel = { zh: string; en: string };

const SORT_COMPACT_LABELS: Record<MarketSortKey, DualLabel> = {
  latest: { zh: '最新', en: 'Latest' },
  hot: { zh: '最热', en: 'Hot' },
  closing: { zh: '即将', en: 'Soon' },
  bounty: { zh: '高赏', en: 'Bounty' },
  following: { zh: '我的', en: 'My' },
};

const STATUS_COMPACT_LABELS: Record<StatusFilterKey, DualLabel> = {
  all: { zh: '全部', en: 'All' },
  live: { zh: '进行', en: 'Live' },
  closing: { zh: '1小时', en: '1h' },
  closed: { zh: '已结', en: 'Closed' },
};

const POOL_COMPACT_LABELS: Record<PoolFilterKey, DualLabel> = {
  any: { zh: '全部', en: 'All' },
  under10k: { zh: '<10K', en: '<10K' },
  mid: { zh: '10-50K', en: '10-50K' },
  over50k: { zh: '>50K', en: '>50K' },
};

const TEMPLATE_COMPACT_LABELS: Record<TemplateFilterKey, DualLabel> = {
  any: { zh: '全部', en: 'All' },
  coin: { zh: '币价', en: 'Token' },
  macro: { zh: '宏观', en: 'Macro' },
  sports: { zh: '赛事', en: 'Sports' },
};

type TemplateMatcher = (card: MarketCard) => TemplateFilterKey;

const resolveTemplateType: TemplateMatcher = (card) => {
  const tags = card.entities.map((entity) => entity.toLowerCase());
  if (tags.some((tag) => ['btc', 'eth', 'sol', 'ton', 'bnb'].includes(tag))) return 'coin';
  if (tags.some((tag) => ['macro', 'cpi', 'gdp', 'economy'].includes(tag))) return 'macro';
  if (tags.some((tag) => ['uefa', 'madrid', 'sports', 'event'].includes(tag))) return 'sports';
  return 'event';
};

export function HomeGlass() {
  const navigate = useNavigate();
  const { t, locale } = useI18n(['home', 'market']);
  const { mode } = useTheme();
  const isLight = mode === 'light';

  const [activeSort, setActiveSort] = useState<MarketSortKey>('latest');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [poolFilter, setPoolFilter] = useState<PoolFilterKey>('any');
  const [templateFilter, setTemplateFilter] = useState<TemplateFilterKey>('any');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const catalogQuery = useMarketsQuery('all');
  const catalogCards = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);

  const feedQuery = useInfiniteQuery<HomeFeedPage>({
    ...homePageQuery(activeSort),
  });

  const feedPages = useMemo(() => feedQuery.data?.pages ?? [], [feedQuery.data?.pages]);
  const feedCards = useMemo(() => feedPages.flatMap((page) => page.items), [feedPages]);

  useEffect(() => {
    const seeds = [...catalogCards, ...feedCards];
    if (seeds.length === 0) {
      return;
    }
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      seeds.forEach((card) => {
        if (card.isFavorite && !next.has(card.id)) {
          next.add(card.id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [catalogCards, feedCards]);

  const handleFavoriteToggle = useCallback((marketId: string, next: boolean) => {
    setFavoriteIds((prev) => {
      const updated = new Set(prev);
      if (next) {
        updated.add(marketId);
      } else {
        updated.delete(marketId);
      }
      return updated;
    });
  }, []);

  const enrichedCatalog = useMemo(
    () => catalogCards.map((card) => ({ ...card, isFavorite: favoriteIds.has(card.id) })),
    [catalogCards, favoriteIds],
  );

  const enrichedFeedCards = useMemo(
    () => feedCards.map((card) => ({ ...card, isFavorite: favoriteIds.has(card.id) })),
    [feedCards, favoriteIds],
  );

  const cardsSource = useMemo(() => {
    if (activeSort === 'following') {
      return enrichedCatalog
        .filter((card) => favoriteIds.has(card.id))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
    return enrichedFeedCards;
  }, [activeSort, enrichedCatalog, enrichedFeedCards, favoriteIds]);

  const filteredCards = useMemo(() => {
    const now = Date.now();
    return cardsSource.filter((card) => {
      const timeLeft = card.endsAt - now;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && timeLeft > 0) ||
        (statusFilter === 'closing' && timeLeft > 0 && timeLeft <= 60 * 60 * 1000) ||
        (statusFilter === 'closed' && timeLeft <= 0);

      const matchesPool =
        poolFilter === 'any' ||
        (poolFilter === 'under10k' && card.pool < 10_000) ||
        (poolFilter === 'mid' && card.pool >= 10_000 && card.pool <= 50_000) ||
        (poolFilter === 'over50k' && card.pool > 50_000);

      const matchesTemplate = templateFilter === 'any' || resolveTemplateType(card) === templateFilter;

      if (!matchesStatus || !matchesPool || !matchesTemplate) {
        return false;
      }

      if (!searchText.trim()) {
        return true;
      }

      const keyword = searchText.trim().toLowerCase();
      return (
        card.title.toLowerCase().includes(keyword) ||
        card.entities.some((entity) => entity.toLowerCase().includes(keyword))
      );
    });
  }, [cardsSource, poolFilter, searchText, statusFilter, templateFilter]);

  const daoPool = feedPages[0]?.daoPool ?? 0;

  const daoDelta = useMemo(() => {
    if (enrichedFeedCards.length === 0) {
      return undefined;
    }
    const sample = enrichedFeedCards.slice(0, 6);
    const avgBounty = sample.reduce((sum, card) => sum + card.bountyMultiplier, 0) / sample.length;
    const value = Math.min(24, Math.max(-12, avgBounty * 3.1));
    return { value, intervalLabel: '24h' } as const;
  }, [enrichedFeedCards]);

  const searchResults = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return enrichedCatalog.slice(0, 8);
    }
    return enrichedCatalog
      .filter(
        (card) =>
          card.title.toLowerCase().includes(keyword) ||
          card.entities.some((entity) => entity.toLowerCase().includes(keyword)),
      )
      .slice(0, 12);
  }, [enrichedCatalog, searchText]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  const isInitialLoading = feedQuery.isLoading && filteredCards.length === 0;
  const showEmptyState = !isInitialLoading && filteredCards.length === 0;

  const handleLoadMore = () => {
    if (feedQuery.hasNextPage) {
      void feedQuery.fetchNextPage();
    }
  };

  const textMutedSecondary = isLight ? 'text-slate-600' : 'text-slate-200/60';
  const borderSoft = isLight ? 'border-slate-300/70' : 'border-white/10';
  const bgSoft = isLight ? 'bg-white/90' : 'bg-white/5';
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US'),
    [locale],
  );

  const sliderBase = 'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-3xl border px-4 py-3 text-xs transition-all duration-150';
  const sliderActive = isLight
    ? 'border-amber-300/80 bg-amber-200/50 text-amber-900 shadow-[0_16px_36px_-24px_rgba(251,191,36,0.45)]'
    : 'border-amber-300/40 bg-amber-300/15 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.55)]';
  const sliderInactive = isLight
    ? 'border-white/65 bg-white/70 text-slate-700 hover:border-amber-200/60 hover:text-amber-600'
    : 'border-white/12 bg-white/10 text-white/70 hover:border-emerald-300/40 hover:text-white';
  const secondaryLabelTone = isLight ? 'text-slate-500' : 'text-white/60';

  const renderCompactLabel = (label: DualLabel, extra?: string) => (
    <span className="flex flex-col items-center leading-tight">
      <span className="text-[13px] font-semibold">{label.zh}</span>
      <span className={clsx('text-[10px] uppercase tracking-[0.35em]', secondaryLabelTone)}>
        {label.en}
        {extra ? ` ${extra}` : ''}
      </span>
    </span>
  );

  const handleStatusSelect = (key: StatusFilterKey) => {
    setStatusFilter(key);
    setShowFilterDrawer(false);
  };

  const handlePoolSelect = (key: PoolFilterKey) => {
    setPoolFilter(key);
    setShowFilterDrawer(false);
  };

  const handleTemplateSelect = (key: TemplateFilterKey) => {
    setTemplateFilter(key);
    setShowFilterDrawer(false);
  };

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-16">
        <HomeTopBar onSearchOpen={() => setSearchOpen(true)} />

        <RealtimeProfitBar total={daoPool} delta={daoDelta} label={t('home:dao.total')} />

        <AuroraPanel
          variant="neutral"
          className={clsx('space-y-3 rounded-[28px] border px-4 py-4 sm:px-6 sm:py-5', isLight ? 'text-slate-800' : 'text-white/80')}
        >
          <div className="grid gap-2 sm:grid-cols-[repeat(4,minmax(78px,1fr))_auto]">
            {(['latest', 'hot', 'closing'] as MarketSortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSort(key)}
                className={clsx(sliderBase, 'w-full min-h-[64px]', activeSort === key ? sliderActive : sliderInactive)}
              >
                {renderCompactLabel(SORT_COMPACT_LABELS[key])}
              </button>
            ))}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSort('following')}
                className={clsx(
                  sliderBase,
                  'min-w-[96px] shrink-0',
                  activeSort === 'following' ? sliderActive : sliderInactive,
                )}
              >
                {renderCompactLabel(SORT_COMPACT_LABELS.following, `(${numberFormatter.format(favoriteIds.size)})`)}
              </button>
              <button
                type="button"
                onClick={() => setShowFilterDrawer((prev) => !prev)}
                className={clsx(
                  sliderBase,
                  'min-w-[84px] shrink-0 flex-row gap-1 text-xs font-semibold',
                  showFilterDrawer ? sliderActive : sliderInactive,
                )}
              >
                {renderCompactLabel({ zh: '全部', en: 'ALL' })}
                {showFilterDrawer ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {showFilterDrawer ? (
            <div className="space-y-3 rounded-[24px] border border-white/12 bg-white/5 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx('text-[10px] uppercase tracking-[0.4em]', secondaryLabelTone)}>状态 Status</span>
                {(['live', 'closing', 'closed', 'all'] as StatusFilterKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusSelect(key)}
                    className={clsx(sliderBase, 'min-w-[80px]', statusFilter === key ? sliderActive : sliderInactive)}
                  >
                    {renderCompactLabel(STATUS_COMPACT_LABELS[key])}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx('text-[10px] uppercase tracking-[0.4em]', secondaryLabelTone)}>奖池 Pool</span>
                {(['any', 'mid', 'over50k'] as PoolFilterKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePoolSelect(key)}
                    className={clsx(sliderBase, 'min-w-[90px]', poolFilter === key ? sliderActive : sliderInactive)}
                  >
                    {renderCompactLabel(POOL_COMPACT_LABELS[key])}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx('text-[10px] uppercase tracking-[0.4em]', secondaryLabelTone)}>模板 Template</span>
                {(['any', 'coin', 'macro', 'sports'] as TemplateFilterKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplateSelect(key)}
                    className={clsx(sliderBase, 'min-w-[90px]', templateFilter === key ? sliderActive : sliderInactive)}
                  >
                    {renderCompactLabel(TEMPLATE_COMPACT_LABELS[key])}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

        </AuroraPanel>

        {isInitialLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`home-glass-skeleton-${index}`} className="glass-card h-40 animate-pulse border-white/10 bg-white/5" />
            ))}
          </div>
        ) : showEmptyState ? (
          <EmptyState type="market" />
        ) : (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <MarketCardGlass
                key={card.id}
                card={card}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}

        {activeSort !== 'following' && feedQuery.hasNextPage ? (
          <GlassButtonGlass
            variant="secondary"
            disabled={feedQuery.isFetchingNextPage}
            onClick={handleLoadMore}
            className="w-full !rounded-2xl"
          >
            {feedQuery.isFetchingNextPage
              ? t('home:buttons.loading')
              : t('home:buttons.loadMore', { count: HOME_PAGE_LIMIT })}
          </GlassButtonGlass>
        ) : null}
      </div>

      <CreateFloatingGlass />

      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-24">
          <div className="w-full max-w-xl px-4">
            <div className={`glass-card space-y-4 p-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-100">{t('home:search.title')}</h2>
                <GlassButtonGlass
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                  className="!rounded-full !px-3"
                >
                  {t('home:search.close')}
                </GlassButtonGlass>
              </div>
              <label className={`flex items-center gap-3 rounded-2xl border ${borderSoft} ${bgSoft} px-4 py-3`}>
                <Search className="h-5 w-5 text-amber-200/80" />
                <input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder={t('home:search.placeholder')}
                  className={`w-full bg-transparent text-sm ${isLight ? 'text-slate-900' : 'text-white'} placeholder:text-slate-300/50 focus:outline-none`}
                />
                {searchText ? (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className={`${textMutedSecondary} transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}
                  >
                    {t('home:search.clear')}
                  </button>
                ) : null}
              </label>
              <div className="space-y-2 text-sm text-slate-200/70">
                {searchResults.length === 0 ? (
                  <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center text-slate-300/70">
                    {t('home:search.empty')}
                  </p>
                ) : (
                  searchResults.map((card) => (
                    <button
                      key={`search-result-${card.id}`}
                      type="button"
                      onClick={() => {
                        navigate(`/market/${card.id}`);
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="flex flex-col">
                        <span className={`flex items-center gap-2 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {card.title}
                          {favoriteIds.has(card.id) ? <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> : null}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.35em] text-slate-300/60">
                          {card.entities.slice(0, 3).join(' · ')}
                        </span>
                      </div>
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
