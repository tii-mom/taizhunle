import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketsQuery } from '../../services/markets';

const MIN_WHALE_AMOUNT = 1000;
const MAX_ENTRIES = 10;
const ROTATE_INTERVAL = 5000;

export function WhaleFeed() {
  const { t, i18n } = useTranslation(['market', 'common']);
  const { data, isLoading, isError } = useMarketsQuery('all');
  const formatter = useMemo(
    () => new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US'),
    [i18n.language],
  );

  const entries = useMemo(() => {
    if (!data) {
      return [];
    }
    return data
      .flatMap((market) =>
        market.bets
          .filter((bet) => bet.amount >= MIN_WHALE_AMOUNT)
          .map((bet) => ({
            id: bet.id,
            user: bet.user,
            amount: formatter.format(bet.amount),
            direction: t(`market:whales.direction.${bet.direction}`),
            market: market.title,
            timestamp: bet.timestamp,
          })),
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ENTRIES);
  }, [data, formatter, t]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (entries.length <= 1) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % entries.length);
    }, ROTATE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [entries]);

  const trackStyle = {
    transform: `translateX(-${activeIndex * 100}%)`,
    transition: 'transform 0.6s ease-in-out',
  } as const;

  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">{t('market:whales.title')}</p>
          <p className="text-sm text-text-secondary">{t('market:realtime.subtitle', { unit: 'TAI' })}</p>
        </div>
        <button type="button" className="rounded-full border border-border bg-background px-4 py-2 text-sm text-text-secondary">
          {t('market:whales.cta')}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-background/60" aria-live="polite">
        {isLoading ? (
          <div className="animate-pulse px-4 py-3 text-sm text-text-secondary">
            <div className="h-4 w-3/4 rounded bg-border" />
          </div>
        ) : isError ? (
          <p className="px-4 py-3 text-sm text-text-secondary">{t('common:loadError')}</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-3 text-sm text-text-secondary">{t('market:whales.empty')}</p>
        ) : (
          <div className="flex" style={trackStyle}>
            {entries.map((entry) => (
              <p key={entry.id} className="min-w-full px-4 py-3 text-sm text-text-secondary">
                {t('market:whales.entry', entry)}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

