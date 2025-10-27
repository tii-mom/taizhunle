import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';
import { useDynamicOdds } from '../../hooks/useDynamicOdds';
import { useCountUp } from '../../hooks/useCountUp';
import { LiveBetting } from './LiveBetting';
import { formatTON, formatTAI } from '../../utils/format';
import type { MarketCard } from '../../services/markets';

type Props = {
  card: MarketCard;
  onPlaceBet: (side: 'yes' | 'no', amount: number) => Promise<void>;
};

export function ExpandedPrediction({ card, onPlaceBet }: Props) {
  const { t } = useTranslation('market');
  const { vibrate } = useHaptic();
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { odds, projectedOdds, hasChanged } = useDynamicOdds(card.id, betAmount, selectedSide);
  const animatedPool = useCountUp(odds.totalPool);

  const handleSubmit = async () => {
    if (!selectedSide || betAmount <= 0) return;

    vibrate(10);
    setIsSubmitting(true);

    try {
      await onPlaceBet(selectedSide, betAmount);
      setBetAmount(100);
      setSelectedSide(null);
    } catch (error) {
      console.error('Bet failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <article className="space-y-6 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {card.status}
            </p>
            <Link
              to={`/detail/${card.id}`}
              className="block text-2xl font-extrabold tracking-tight text-text-primary drop-shadow-[0_0_10px_rgba(var(--accent),0.5)] hover:text-accent xs:text-3xl"
              title={card.title}
            >
              {truncateText(card.title, 60)}
            </Link>
            <p
              className="text-lg text-text-secondary drop-shadow-[0_0_8px_rgba(var(--accent),0.4)] xs:text-xl"
              title={card.description}
            >
              {truncateText(card.description, 120)}
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
            {card.filter === 'closed' ? t('badges.settled') : t('badges.live')}
          </span>
        </div>

        {/* Pool */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {t('pool.label')}
          </p>
          <p className="font-mono text-3xl font-bold text-accent drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]">
            {formatTAI(animatedPool)} TAI
          </p>
        </div>
      </div>

      {/* Yes/No Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            vibrate(10);
            setSelectedSide('yes');
          }}
          className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all ${
            selectedSide === 'yes'
              ? 'border-green-500/50 bg-green-500/10 ring-2 ring-green-500/50'
              : 'border-border-light bg-surface-glass/60 hover:border-green-500/30 hover:ring-2 hover:ring-green-500/30'
          } active:scale-95`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold text-text-primary">{t('yes')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-secondary">{t('odds.label')}</p>
              <p
                className={`font-mono text-2xl font-bold text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] ${
                  hasChanged ? 'animate-pulse-glow' : ''
                }`}
              >
                {projectedOdds ? projectedOdds.yesOdds.toFixed(2) : odds.yesOdds.toFixed(2)}x
              </p>
              {odds.fluctuation !== 0 && (
                <p className="text-xs text-text-secondary">
                  {odds.fluctuation > 0 ? '+' : ''}
                  {odds.fluctuation.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            vibrate(10);
            setSelectedSide('no');
          }}
          className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all ${
            selectedSide === 'no'
              ? 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/50'
              : 'border-border-light bg-surface-glass/60 hover:border-red-500/30 hover:ring-2 hover:ring-red-500/30'
          } active:scale-95`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-lg font-semibold text-text-primary">{t('no')}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-secondary">{t('odds.label')}</p>
              <p
                className={`font-mono text-2xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] ${
                  hasChanged ? 'animate-pulse-glow' : ''
                }`}
              >
                {projectedOdds ? projectedOdds.noOdds.toFixed(2) : odds.noOdds.toFixed(2)}x
              </p>
              {odds.fluctuation !== 0 && (
                <p className="text-xs text-text-secondary">
                  {odds.fluctuation > 0 ? '+' : ''}
                  {(-odds.fluctuation).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Bet Input */}
      {selectedSide && (
        <div className="space-y-3 rounded-xl border border-border-light bg-background/40 p-4 backdrop-blur-sm">
          <label className="block text-sm text-text-secondary">
            {t('bet.amountLabel')}
            <div className="relative mt-2">
              <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
                step={1}
                className="w-full rounded-xl border border-border-light bg-surface-glass/60 py-3 pl-10 pr-3 font-mono text-lg backdrop-blur-md transition-all focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || betAmount <= 0}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-light px-6 py-3 font-semibold text-accent-contrast shadow-lg transition-all hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t('bet.submitting') : t('bet.confirm')}
          </button>

          {projectedOdds && (
            <p className="text-center text-xs text-text-secondary">
              {t('bet.projected')}: {formatTON(betAmount * (selectedSide === 'yes' ? projectedOdds.yesOdds : projectedOdds.noOdds))} TAI
            </p>
          )}
        </div>
      )}

      {/* Live Stats */}
      <LiveBetting marketId={card.id} />
    </article>
  );
}
