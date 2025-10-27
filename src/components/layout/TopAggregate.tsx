import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useMarketsQuery } from '../../services/markets';
import { useCountUp } from '../../hooks/useCountUp';
import { useHaptic } from '../../hooks/useHaptic';

const MIN_WHALE_AMOUNT = 1000;
const MAX_ENTRIES = 10;
const ROTATE_INTERVAL = 5000;
const STORAGE_KEY = 'topCollapsed';

export function TopAggregate() {
  const { t, i18n } = useTranslation(['theme', 'market']);
  const { vibrate } = useHaptic();
  const { data, isLoading } = useMarketsQuery('all');
  
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const total = useMemo(() => (data ?? []).reduce((sum, market) => sum + market.pool, 0), [data]);
  const animatedTotal = useCountUp(total);

  const whaleEntries = useMemo(() => {
    if (!data) return [];
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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    if (whaleEntries.length <= 1 || isPaused) return undefined;
    
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % whaleEntries.length);
    }, ROTATE_INTERVAL);
    
    return () => window.clearInterval(timer);
  }, [whaleEntries, isPaused]);

  const handleToggleCollapse = () => {
    vibrate();
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
  };

  const trackStyle = {
    transform: `translateX(-${activeIndex * 100}%)`,
    transition: 'transform 0.6s ease-in-out',
  } as const;

  if (isLoading) {
    return (
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-surface-glass/70 backdrop-blur-lg lg:hidden">
        <div className="mx-auto max-w-4xl animate-pulse px-6 py-3">
          <div className="h-8 w-48 rounded bg-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-surface-glass/70 backdrop-blur-lg lg:hidden">
      <div className="mx-auto max-w-4xl px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{t('theme:pool.total')}</p>
            <p className="animate-pulse font-mono text-3xl font-semibold text-accent shadow-accent/50 xs:text-4xl">
              {formatter.format(animatedTotal)} TAI
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
            title={collapsed ? t('theme:top.collapse') : t('theme:top.collapse')}
          >
            {collapsed ? <ChevronDown size={20} className="text-text-secondary" /> : <ChevronUp size={20} className="text-text-secondary" />}
          </button>
        </div>

        {!collapsed && whaleEntries.length > 0 && (
          <div
            className="mt-3 overflow-hidden rounded-xl border border-light bg-background/60 backdrop-blur-sm"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="flex" style={trackStyle}>
              {whaleEntries.map((entry) => (
                <p key={entry.id} className="min-w-full truncate px-4 py-2 text-sm text-text-secondary" title={t('market:whales.entry', entry)}>
                  {t('market:whales.entry', entry).slice(0, 60)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
