import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Star } from 'lucide-react';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { MarketCardGlass } from '@/components/glass/MarketCardGlass';
import { CreateFloatingGlass } from '@/components/glass/CreateFloatingGlass';
import { RealtimeProfitBar } from '@/components/glass/RealtimeProfitBar';
import { EmptyState } from '@/components/common/EmptyState';
import { GoldenHammer } from '@/components/glass/GoldenHammer';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import type { MarketCard, MarketSortKey } from '@/services/markets';
import { useMarketsQuery } from '@/services/markets';
import { HOME_PAGE_LIMIT, homePageQuery, type HomeFeedPage } from '@/queries/homePage';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

type StatusFilterKey = 'all' | 'live' | 'closing' | 'closed';
type PoolFilterKey = 'any' | 'under10k' | 'mid' | 'over50k';
type TemplateFilterKey = 'any' | 'coin' | 'macro' | 'sports' | 'event';

type SortOption = { key: MarketSortKey; labelKey: string; withCount?: boolean };
type FilterOption<K> = { key: K; labelKey: string };

type TemplateMatcher = (card: MarketCard) => TemplateFilterKey;

const FEED_SORTS: SortOption[] = [
  { key: 'latest', labelKey: 'home:filters.sort.latest' },
  { key: 'hot', labelKey: 'home:filters.sort.hot' },
  { key: 'closing', labelKey: 'home:filters.sort.closing' },
  { key: 'bounty', labelKey: 'home:filters.sort.bounty' },
  { key: 'following', labelKey: 'home:filters.sort.following', withCount: true },
];

const STATUS_FILTERS: FilterOption<StatusFilterKey>[] = [
  { key: 'all', labelKey: 'home:filters.status.all' },
  { key: 'live', labelKey: 'home:filters.status.live' },
  { key: 'closing', labelKey: 'home:filters.status.closing' },
  { key: 'closed', labelKey: 'home:filters.status.closed' },
];

const POOL_FILTERS: FilterOption<PoolFilterKey>[] = [
  { key: 'any', labelKey: 'home:filters.pool.any' },
  { key: 'under10k', labelKey: 'home:filters.pool.under10k' },
  { key: 'mid', labelKey: 'home:filters.pool.mid' },
  { key: 'over50k', labelKey: 'home:filters.pool.over50k' },
];

const TEMPLATE_FILTERS: FilterOption<TemplateFilterKey>[] = [
  { key: 'any', labelKey: 'home:filters.template.any' },
  { key: 'coin', labelKey: 'home:filters.template.coin' },
  { key: 'macro', labelKey: 'home:filters.template.macro' },
  { key: 'sports', labelKey: 'home:filters.template.sports' },
  { key: 'event', labelKey: 'home:filters.template.event' },
];

const resolveTemplateType: TemplateMatcher = (card) => {
  const tags = card.entities.map((entity) => entity.toLowerCase());
  if (tags.some((tag) => ['btc', 'eth', 'sol', 'ton', 'bnb'].includes(tag))) return 'coin';
  if (tags.some((tag) => ['macro', 'cpi', 'gdp', 'economy'].includes(tag))) return 'macro';
  if (tags.some((tag) => ['uefa', 'madrid', 'sports', 'event'].includes(tag))) return 'sports';
  return 'event';
};

export function HomeGlass() {
  const navigate = useNavigate();
  const { t, locale, changeLanguage } = useI18n(['home', 'market']);
  const { mode, toggle } = useTheme();
  const isLight = mode === 'light';

  const [activeSort, setActiveSort] = useState<MarketSortKey>('latest');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [poolFilter, setPoolFilter] = useState<PoolFilterKey>('any');
  const [templateFilter, setTemplateFilter] = useState<TemplateFilterKey>('any');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
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

  const hammerPoints = useMemo(
    () => enrichedCatalog.reduce((sum, card) => sum + card.juryCount * 12, 0),
    [enrichedCatalog],
  );
  const hammerLevel = hammerPoints >= 200 ? 'gold' : hammerPoints >= 50 ? 'silver' : hammerPoints >= 10 ? 'bronze' : 'gray';
  const hammerLevelText = t(`home:hammer.${hammerLevel}`);
  const hammerLevelLabel = t('home:hammer.level', {
    level: Math.max(1, Math.floor(hammerPoints / 25)),
    points: hammerPoints,
  });
  const activeHammerCount = useMemo(
    () => enrichedCatalog.filter((card) => card.juryCount > 0).length,
    [enrichedCatalog],
  );

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

  const textMuted = isLight ? 'text-slate-700' : 'text-slate-200/70';
  const textMutedSecondary = isLight ? 'text-slate-600' : 'text-slate-200/60';
  const borderSoft = isLight ? 'border-slate-300/70' : 'border-white/10';
  const borderHover = isLight ? 'hover:border-slate-500/80' : 'hover:border-white/20';
  const bgSoft = isLight ? 'bg-white/90' : 'bg-white/5';
  const chipInactive = isLight
    ? 'text-slate-700 font-medium hover:text-slate-900'
    : 'text-slate-200/60 hover:text-white';
  const chipBorder = isLight ? 'border-slate-300/80' : 'border-white/10';
  const searchHover = isLight ? 'hover:text-slate-900' : 'hover:text-white';
  const badgeBorder = isLight ? 'border-slate-300/80' : 'border-white/10';

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US'),
    [locale],
  );
  const nextLocale = locale.startsWith('zh') ? 'en' : 'zh';
  const languageLabel = locale.startsWith('zh')
    ? t('home:buttons.languageEn')
    : t('home:buttons.languageZh');
  const themeLabel = mode === 'light' ? t('home:buttons.themeDark') : t('home:buttons.themeLight');

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-16">
        <header className={`glass-card flex items-center justify-between gap-4 p-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`flex flex-1 items-center gap-3 rounded-2xl border ${borderSoft} ${bgSoft} px-4 py-2 text-left text-sm ${textMuted} transition-colors duration-150 ${borderHover} ${searchHover}`}
          >
            <Search className="h-4 w-4 text-amber-200/80" />
            <span className="truncate">{t('home:search.open')}</span>
          </button>
          <GlassButtonGlass
            onClick={() => navigate('/create')}
            className="!rounded-2xl !px-4 !py-2 text-xs uppercase tracking-[0.3em]"
          >
            <Sparkles className="h-4 w-4" />
            {t('home:buttons.create')}
          </GlassButtonGlass>
          <div className="flex items-center gap-2">
            <GlassButtonGlass
              variant="ghost"
              onClick={() => {
                void changeLanguage(nextLocale);
              }}
              className="!rounded-2xl !px-3 !py-2 text-xs uppercase tracking-[0.3em]"
            >
              {languageLabel}
            </GlassButtonGlass>
            <GlassButtonGlass
              variant="ghost"
              onClick={toggle}
              className="!rounded-2xl !px-3 !py-2 text-xs uppercase tracking-[0.3em]"
            >
              {themeLabel}
            </GlassButtonGlass>
          </div>
          <div
            className={`flex items-center gap-3 rounded-2xl border ${badgeBorder} ${bgSoft} px-3 py-2 ${textMuted}`}
          >
            <GoldenHammer count={activeHammerCount} level={hammerLevel} />
            <div>
              <p className="text-xs font-semibold text-amber-100/80 uppercase tracking-[0.2em]">{hammerLevelText}</p>
              <p className="text-[11px]">
                {hammerLevelLabel}
              </p>
            </div>
          </div>
        </header>

        <RealtimeProfitBar total={daoPool} delta={daoDelta} label={t('home:dao.total')} />

        <section className={`glass-card flex flex-col gap-4 p-4 ${isLight ? 'text-slate-900' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            {FEED_SORTS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveSort(option.key)}
                className={`rounded-2xl px-3 py-1 text-xs font-medium uppercase tracking-widest transition-all duration-150 ${
                  activeSort === option.key
                    ? 'bg-amber-300/20 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : chipInactive
                }`}
              >
                {t(option.labelKey, option.withCount ? { count: numberFormatter.format(favoriteIds.size) } : {})}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setStatusFilter(option.key)}
                className={`rounded-2xl border px-3 py-1 text-xs uppercase tracking-[0.35em] transition-all ${
                  statusFilter === option.key
                    ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                    : `${chipBorder} ${chipInactive}`
                }`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-2">
              {POOL_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPoolFilter(option.key)}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.35em] transition-all ${
                    poolFilter === option.key
                      ? 'border-amber-300/40 bg-amber-400/20 text-amber-50'
                      : `${chipBorder} ${chipInactive}`
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {TEMPLATE_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTemplateFilter(option.key)}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.35em] transition-all ${
                    templateFilter === option.key
                      ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-50'
                      : `${chipBorder} ${chipInactive}`
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
            <p className={`text-[11px] uppercase tracking-[0.35em] ${textMutedSecondary}`}>
              {t('home:filters.pagingNote', { count: HOME_PAGE_LIMIT })}
            </p>
        </section>

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
