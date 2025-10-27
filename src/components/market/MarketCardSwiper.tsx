import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TrendingUp, Share2, DollarSign } from 'lucide-react';
import type { MarketCard } from '../../services/markets';
import { useHaptic } from '../../hooks/useHaptic';
import { BetModal } from '../BetModal';

const AUTO_PLAY_INTERVAL = 8000;
const LONG_PRESS_DURATION = 500;

type Props = {
  cards: MarketCard[];
  onPlaceBet: (card: MarketCard) => void;
  onShare: (card: MarketCard) => void;
  isReady: boolean;
};

export function MarketCardSwiper({ cards, onPlaceBet, onShare, isReady }: Props) {
  const { t, i18n } = useTranslation(['market', 'detail']);
  const { vibrate } = useHaptic();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickBetCard, setQuickBetCard] = useState<MarketCard | null>(null);
  const longPressTimerRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );

  // Auto play
  useEffect(() => {
    if (cards.length <= 1 || isPaused) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % cards.length;
        if (containerRef.current) {
          containerRef.current.scrollLeft = next * containerRef.current.offsetWidth;
        }
        return next;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [cards.length, isPaused]);

  const handleTouchStart = (card: MarketCard) => {
    vibrate();
    longPressTimerRef.current = window.setTimeout(() => {
      setQuickBetCard(card);
      vibrate();
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }
  };

  const handleQuickBet = async (_values: { amount: number; note?: string }) => {
    if (quickBetCard) {
      await onPlaceBet(quickBetCard);
      setQuickBetCard(null);
    }
  };

  const handleScroll = (e: { currentTarget: HTMLDivElement }) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'smooth', touchAction: 'pan-x' }}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {cards.map((card) => (
          <article
            key={card.id}
            className="min-w-full snap-start rounded-xl border border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md"
            onTouchStart={() => handleTouchStart(card)}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart(card)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{card.status}</p>
                  <Link
                    to={`/detail/${card.id}`}
                    className="mt-1 block text-xl font-semibold text-text-primary hover:text-accent"
                  >
                    {card.title}
                  </Link>
                  <p className="mt-1 text-sm text-text-secondary">{card.description}</p>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary">
                  {card.filter === 'closed' ? t('market:badges.settled') : t('market:badges.live')}
                </span>
              </div>
              <div className="flex flex-wrap gap-6 rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-sm text-text-secondary">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="text-xs uppercase tracking-wide text-text-secondary/80">{t('market:card.oddsLabel')}</p>
                  <p className="font-mono text-lg font-semibold text-accent shadow-accent/30">{card.odds}</p>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="text-xs uppercase tracking-wide text-text-secondary/80">{t('market:card.volumeLabel')}</p>
                  <p className="font-mono text-lg font-semibold text-text-primary">
                    {numberFormatter.format(parseFloat(card.volume.replace(/[^\d.]/g, '')))}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
                  onClick={() => {
                    vibrate();
                  }}
                >
                  <TrendingUp size={20} />
                  {t('market:cta.enter')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    vibrate();
                    void onPlaceBet(card);
                  }}
                  disabled={!isReady}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-primary transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-60 md:hover:shadow-lg"
                >
                  <DollarSign size={20} className="text-accent" />
                  {t('market:cta.place')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    vibrate();
                    void onShare(card);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-secondary transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
                >
                  <Share2 size={20} className="text-text-secondary" />
                  {t('market:cta.share')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Indicators */}
      {cards.length > 1 && (
        <div className="flex justify-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                vibrate();
                setCurrentIndex(index);
                if (containerRef.current) {
                  containerRef.current.scrollLeft = index * containerRef.current.offsetWidth;
                }
              }}
              className={`h-2 w-8 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-accent shadow-accent/30' : 'bg-text-secondary/30'
              }`}
              aria-label={t('market:card.swipe')}
            />
          ))}
        </div>
      )}

      {/* Quick Bet Modal */}
      <BetModal
        open={!!quickBetCard}
        title={t('market:card.quickBet')}
        confirmLabel={t('detail:cta.bet')}
        cancelLabel={t('detail:cta.cancel')}
        amountLabel={t('detail:modal.amountLabel')}
        amountError={t('detail:modal.amountError')}
        noteLabel={t('detail:modal.noteLabel')}
        noteError={t('detail:modal.noteError')}
        onClose={() => setQuickBetCard(null)}
        onSubmit={handleQuickBet}
      />
    </div>
  );
}
