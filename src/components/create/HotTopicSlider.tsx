import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Sparkles } from 'lucide-react';

import { loadHotTopics, type HotTopic } from '@/services/marketInsights';
import { useI18n } from '@/hooks/useI18n';

const TAGS: Array<{ key: string; icon: string }> = [
  { key: 'trending', icon: '🔥' },
  { key: 'sports', icon: '⚽' },
  { key: 'politics', icon: '🏛️' },
  { key: 'society', icon: '🌐' },
  { key: 'entertainment', icon: '🎬' },
  { key: 'crypto', icon: '🪙' },
];

type HotTopicSliderProps = {
  currentTitle: string;
  onApplyTemplate: (topic: HotTopic & { similarity: number }) => void;
  onTagChange?: (tag: string) => void;
  initialTag?: string;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }
  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection++;
    }
  });
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function HotTopicSlider({ currentTitle, onApplyTemplate, onTagChange, initialTag }: HotTopicSliderProps) {
  const { t } = useI18n(['create']);
  const [activeTag, setActiveTag] = useState<string>(initialTag ?? 'trending');

  useEffect(() => {
    if (initialTag && initialTag !== activeTag) {
      setActiveTag(initialTag);
    }
  }, [initialTag, activeTag]);

  const handleTagSwitch = useCallback(
    (tag: string) => {
      setActiveTag(tag);
      onTagChange?.(tag);
    },
    [onTagChange],
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['hot-topics', activeTag],
    queryFn: () => loadHotTopics(activeTag === 'trending' ? undefined : activeTag, 12),
    staleTime: 5 * 60 * 1000,
  });

  const topicsWithScore = useMemo(() => {
    const source = data ?? [];
    return source.map((topic) => {
      const similarity = currentTitle ? Math.max(
        jaccardSimilarity(currentTitle, topic.title),
        jaccardSimilarity(currentTitle, topic.template.title),
      ) : 0;
      return {
        ...topic,
        similarity,
      };
    });
  }, [currentTitle, data]);

  const recommendedThreshold = 0.7;

  const handleApply = useCallback(
    (topic: HotTopic & { similarity: number }) => {
      onApplyTemplate(topic);
    },
    [onApplyTemplate],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">
            {t('create:hotTopics.title')}
          </h4>
          <p className="text-xs text-white/50">{t('create:hotTopics.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="glass-button-secondary flex items-center gap-1 !rounded-full !px-3 !py-1 text-[11px] disabled:opacity-40"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          {t('create:hotTopics.refresh')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag.key}
            type="button"
            onClick={() => handleTagSwitch(tag.key)}
            className={`glass-button-secondary !rounded-full !px-4 !py-1 text-xs transition ${
              activeTag === tag.key
                ? '!border-emerald-300/60 !bg-emerald-400/15 !text-emerald-100'
                : '!border-white/15 !text-white/60 hover:!border-white/30 hover:!text-white'
            }`}
          >
            <span className="mr-1">{tag.icon}</span>
            {t(`create:hotTopics.${tag.key}`)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-full gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-32 min-w-[260px] animate-pulse rounded-3xl border border-white/10 bg-white/5"
              />
            ))
          ) : topicsWithScore.length === 0 ? (
            <div className="min-w-[260px] rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
              {t('create:hotTopics.empty')}
            </div>
          ) : (
            topicsWithScore.map((topic) => {
              const heatPercent = Math.round(topic.heat * 100);
              const isRecommended = topic.similarity >= recommendedThreshold;
              return (
                <div
                  key={topic.id}
                  className={`relative flex min-w-[280px] max-w-[300px] flex-col justify-between gap-3 rounded-3xl border px-4 py-4 text-sm shadow-[0_18px_36px_-32px_rgba(56,189,248,0.4)] transition ${
                    isRecommended
                      ? 'border-emerald-300/60 bg-emerald-400/15'
                      : 'border-white/12 bg-white/6 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-200">
                          {t('create:hotTopics.heat', { value: heatPercent })}
                        </span>
                        {isRecommended ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-300/20 px-2 py-0.5 text-[11px] text-emerald-100">
                            <Sparkles size={12} />
                            {t('create:hotTopics.recommended')}
                          </span>
                        ) : null}
                      </div>
                      <h5 className="text-base font-semibold text-white">
                        {topic.title}
                      </h5>
                      <p className="line-clamp-2 text-xs text-white/70">{topic.template.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex flex-wrap gap-1">
                      {topic.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="glass-button-primary !rounded-full !px-3 !py-1 text-[11px]"
                      onClick={() => handleApply(topic)}
                    >
                      {t('create:hotTopics.apply')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
