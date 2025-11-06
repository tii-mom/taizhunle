import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-react';

import { AuroraPanel } from '@/components/glass/AuroraPanel';
import { loadMarketNews, type MarketNewsItem } from '@/services/marketInsights';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

type MarketNewsDrawerProps = {
  marketId: string;
  tags?: string[];
};

function formatTimeAgo(date: Date, locale: string): string {
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', {
    numeric: 'auto',
  });

  if (Math.abs(diffSeconds) < 60) {
    return formatter.format(-diffSeconds, 'second');
  }
  if (Math.abs(diffSeconds) < 3600) {
    return formatter.format(-Math.round(diffSeconds / 60), 'minute');
  }
  if (Math.abs(diffSeconds) < 86400) {
    return formatter.format(-Math.round(diffSeconds / 3600), 'hour');
  }
  return formatter.format(-Math.round(diffSeconds / 86400), 'day');
}

function sentimentColor(sentiment: MarketNewsItem['sentiment'], isLight: boolean): string {
  switch (sentiment) {
    case 'positive':
      return isLight ? 'bg-emerald-500/80' : 'bg-emerald-300';
    case 'negative':
      return isLight ? 'bg-rose-500/80' : 'bg-rose-300';
    default:
      return isLight ? 'bg-slate-400/80' : 'bg-slate-300';
  }
}

export function MarketNewsDrawer({ marketId, tags }: MarketNewsDrawerProps) {
  const { t, locale } = useI18n(['detail']);
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['market-news', marketId, Array.isArray(tags) && tags.length ? tags.join(',') : ''],
    queryFn: () => loadMarketNews(marketId, tags),
    enabled: Boolean(marketId),
    staleTime: 5 * 60 * 1000,
  });

  const hasContent = (data?.length ?? 0) > 0;
  const items = useMemo(() => data ?? [], [data]);

  return (
    <AuroraPanel
      variant="cyan"
      className={`${open ? 'space-y-4' : 'space-y-2'} transition-[padding]`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-2 text-left text-sm font-semibold text-white/90"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
            {open ? t('detail:news.openLabel') : t('detail:news.closedLabel')}
          </button>
          <p className="text-xs text-white/60">{t('detail:news.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="glass-button-secondary flex items-center gap-1 !rounded-full !px-3 !py-1 text-[11px] disabled:opacity-40"
        >
          {isFetching ? <Loader2 size={12} className="animate-spin" /> : <Loader2 size={12} />}
          {t('detail:news.refresh')}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`news-skeleton-${index}`}
                  className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/10"
                />
              ))}
            </div>
          ) : !hasContent ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {t('detail:news.empty')}
            </p>
          ) : (
            items.map((item) => {
              const publishedAt = new Date(item.publishedAt);
              const timeAgo = formatTimeAgo(publishedAt, locale);
              const dotColor = sentimentColor(item.sentiment, isLight);
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/12 bg-white/8 p-4 text-sm text-white/80"
                >
                  <header className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white/90">{item.source}</span>
                      <span className="text-white/50">· {t('detail:news.sourceType.' + item.sourceType)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60">{timeAgo}</span>
                      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden="true" />
                    </div>
                  </header>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">{item.summary}</p>
                  <footer className="mt-3 flex items-center justify-between text-xs text-white/60">
                    <span>{t(`detail:news.sentiment.${item.sentiment}`)}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-emerald-100"
                    >
                      {t('detail:news.openLink')}
                      <ExternalLink size={12} />
                    </a>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      ) : null}
    </AuroraPanel>
  );
}
