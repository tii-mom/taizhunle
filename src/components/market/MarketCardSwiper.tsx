import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Share2, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { MarketCard } from '../../services/markets';
import { useHaptic } from '../../hooks/useHaptic';
import { BetModalGlass } from '../glass/BetModalGlass';
import { GlassModalGlass } from '../glass/GlassModalGlass';
import { MarketCardGlass } from '../glass/MarketCardGlass';
import { GlassButtonGlass } from '../glass/GlassButtonGlass';
import { betQuery } from '@/queries/bet';

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
  const quickBet = useQuery({
    ...betQuery(quickBetCard?.id ?? ''),
    enabled: Boolean(quickBetCard?.id),
  });
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

  const handleQuickBet = async (_values: { amount: number; note?: string; autoClaim?: boolean }) => {
    if (!quickBetCard) {
      return;
    }
    await onPlaceBet(quickBetCard);
    setQuickBetCard(null);
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
          <div
            key={card.id}
            className="min-w-full snap-start space-y-4"
            onTouchStart={() => handleTouchStart(card)}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart(card)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <MarketCardGlass card={card} />
            <div className="glass-card-sm flex flex-wrap items-center justify-between gap-3 border-white/10 bg-white/5 px-5 py-4 text-sm text-white/60">
              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-amber-100/70">
                <span>{card.filter === 'closed' ? t('market:badges.settled') : t('market:badges.live')}</span>
                <span>{t('market:card.volumeLabel')} · {numberFormatter.format(parseFloat(card.volume.replace(/[^\d.]/g, '')))} TAI</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <GlassButtonGlass
                  onClick={() => vibrate()}
                  className="!rounded-full !px-5 !py-2 text-xs"
                >
                  <TrendingUp size={18} />
                  {t('market:cta.enter')}
                </GlassButtonGlass>
                <GlassButtonGlass
                  variant="secondary"
                  disabled={!isReady}
                  onClick={() => {
                    vibrate();
                    void onPlaceBet(card);
                  }}
                  className="!rounded-full !px-5 !py-2 text-xs"
                >
                  <DollarSign size={18} className="text-amber-200" />
                  {t('market:cta.place')}
                </GlassButtonGlass>
                <GlassButtonGlass
                  variant="ghost"
                  onClick={() => {
                    vibrate();
                    void onShare(card);
                  }}
                  className="!rounded-full !px-5 !py-2 text-xs"
                >
                  <Share2 size={18} />
                  {t('market:cta.share')}
                </GlassButtonGlass>
              </div>
            </div>
          </div>
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
      <GlassModalGlass
        open={!!quickBetCard}
        title={quickBet.data?.marketTitle}
        onClose={() => setQuickBetCard(null)}
      >
        {quickBet.isPending || !quickBet.data ? (
          <div className="glass-card h-72 animate-pulse border-white/10 bg-white/5" />
        ) : (
          <BetModalGlass
            data={quickBet.data}
            submitLabel={t('detail:cta.bet')}
            cancelLabel={t('detail:cta.cancel')}
            onSubmit={handleQuickBet}
            onClose={() => setQuickBetCard(null)}
          />
        )}
      </GlassModalGlass>
    </div>
  );
}
