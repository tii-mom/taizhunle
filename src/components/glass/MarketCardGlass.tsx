import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

import { CountUp } from './CountUp';
import { CountDown } from './CountDown';
import { Confetti } from './Confetti';
import { QuickBetModal } from './QuickBetModal';
import { JurorRewardBadge } from './JurorRewardBadge';
import { marketCardQuery } from '@/queries/marketCard';
import type { MarketCard } from '@/services/markets';

// 移除锤子等级系统

type MarketCardGlassProps = {
  card: MarketCard;
  onFavoriteToggle?: (id: string, next: boolean) => void;
};

export function MarketCardGlass({ card, onFavoriteToggle }: MarketCardGlassProps) {
  const navigate = useNavigate();
  const { data } = useQuery(marketCardQuery(card.id));
  const [celebrate, setCelebrate] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(card.isFavorite));
  const [quickBet, setQuickBet] = useState<{ side: 'yes' | 'no' } | null>(null);
  const { t, locale } = useI18n(['home', 'market']);
  const { mode } = useTheme();
  const isLight = mode === 'light';

  const snapshot = data ?? {
    id: card.id,
    pool: card.pool,
    participants: card.bets.length,
    endTime: card.endsAt,
    juryCount: card.juryCount,
    targetPool: card.targetPool,
  };

  useEffect(() => {
    if (!data) {
      return;
    }
    if (data.pool > card.pool) {
      setCelebrate(true);
    }
  }, [card.pool, data]);

  useEffect(() => {
    if (!celebrate) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCelebrate(false), 800);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  useEffect(() => {
    setIsFavorite(Boolean(card.isFavorite));
  }, [card.isFavorite]);

  const handleFavorite = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setIsFavorite((prev) => {
      const next = !prev;
      onFavoriteToggle?.(card.id, next);
      return next;
    });
  };

  const progress = useMemo(() => Math.min((snapshot.pool / snapshot.targetPool) * 100, 100), [snapshot.pool, snapshot.targetPool]);
  const endingSoon = useMemo(() => snapshot.endTime - Date.now() < 45 * 60 * 1000, [snapshot.endTime]);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US'),
    [locale],
  );

  const tagStyle = isLight
    ? 'border-amber-400/50 bg-amber-100/90 text-amber-700 shadow-[0_12px_20px_-18px_rgba(217,119,6,0.55)]'
    : 'border-amber-300/35 bg-amber-400/10 text-amber-100';
  const closingBadge = isLight
    ? 'border-rose-400/50 bg-rose-100/85 text-rose-700'
    : 'border-rose-400/30 bg-rose-400/10 text-rose-100';
  const panelStyle = isLight
    ? 'border-slate-200/80 bg-white/85 text-slate-800 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)]'
    : 'border-white/10 bg-white/5 text-slate-200/80';
  const metaText = isLight ? 'text-slate-600' : 'text-slate-200/60';
  const valueText = isLight ? 'text-slate-800' : 'text-slate-200/80';
  const chipBase = isLight
    ? 'border-slate-300/70 text-slate-700 hover:border-slate-500/80 hover:text-slate-900'
    : 'border-white/10 text-slate-200/60 hover:border-white/20 hover:text-white';
  const oddsTone = isLight ? 'text-emerald-600' : 'text-emerald-200';
  const countdownTone = isLight ? 'text-amber-600' : 'text-amber-100';
  const bountyTone = isLight ? 'text-amber-700' : 'text-amber-100';
  const infoTone = isLight ? 'text-slate-700' : 'text-slate-200/80';
  const infoBadgeTone = isLight
    ? 'border-white/70 bg-white/85 text-slate-700 shadow-[0_12px_24px_-24px_rgba(148,163,184,0.45)]'
    : 'border-white/15 bg-white/10 text-white/80';
  const betButtonTone = isLight
    ? 'border-emerald-300/70 bg-emerald-400/15 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-300/25'
    : 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100 hover:border-emerald-300/60 hover:bg-emerald-300/20';
  const betButtonToneNo = isLight
    ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-300/25'
    : 'border-cyan-300/30 bg-cyan-300/15 text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-300/20';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => {
        if (quickBet) {
          return;
        }
        navigate(`/market/${card.id}`);
      }}
      onKeyDown={(event) => {
        if (quickBet) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/market/${card.id}`);
        }
      }}
      className="glass-card cursor-pointer select-none p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-[0_30px_60px_-48px_rgba(251,191,36,0.75)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div
            className={`flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] ${
              isLight ? 'text-amber-700/80' : 'text-amber-200/70'
            }`}
          >
            {card.entities.slice(0, 3).map((entity) => (
              <span key={entity} className={`rounded-full px-3 py-1 text-[11px] ${tagStyle}`}>
                {entity}
              </span>
            ))}
            {endingSoon ? (
              <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${closingBadge}`}>
                <Flame className="h-3 w-3" /> {t('home:card.closing')}
              </span>
            ) : null}
          </div>
          <h3
            className={`text-xl font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            } drop-shadow-[0_0_18px_rgba(251,191,36,0.25)]`}
          >
            {card.title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFavorite}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.35em] transition-all ${
              isFavorite
                ? 'border-amber-300/50 bg-amber-400/20 text-amber-100'
                : chipBase
            }`}
          >
            <span className="flex items-center gap-1">
              <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-300 text-amber-300' : 'text-slate-300/50'}`} />
              {t('home:card.follow')}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className={`grid grid-cols-2 gap-4 text-sm ${valueText}`}>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.3em] ${metaText}`}>{t('home:card.pool')}</p>
              <div className="mt-2 flex items-end gap-2">
                <CountUp
                  end={snapshot.pool}
                  duration={800}
                  className={`font-mono text-2xl ${isLight ? 'text-amber-500' : 'text-amber-100'}`}
                />
                <span className={`pb-1 text-xs ${isLight ? 'text-amber-500' : 'text-amber-200/80'}`}>TAI</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-[11px] uppercase tracking-[0.3em] ${metaText}`}>{t('home:card.odds')}</p>
              <span className={`mt-2 block font-mono text-xl font-semibold ${oddsTone}`}>{card.odds}</span>
            </div>
          </div>
          <div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${progress}%` }} />
            </div>
            <div className={`mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.35em] ${metaText}`}>
              <span>{t('home:card.target', { value: numberFormatter.format(snapshot.targetPool) })}</span>
              <span>{t('home:card.participants', { value: numberFormatter.format(snapshot.participants) })}</span>
            </div>
          </div>
        </div>

        <div className={`flex flex-col justify-between gap-4 text-sm ${valueText}`}>
          <div className={`rounded-2xl px-3 py-2 text-right ${panelStyle}`}>
            <p className={`text-[11px] uppercase tracking-[0.3em] ${metaText}`}>{t('home:card.countdown')}</p>
            <CountDown endTime={snapshot.endTime} className={`font-mono text-base ${countdownTone}`} />
          </div>
          <div className={`rounded-2xl px-3 py-2 text-right ${panelStyle}`}>
            <p className={`text-[11px] uppercase tracking-[0.3em] ${metaText}`}>{t('home:card.bounty')}</p>
            <span className={`font-mono text-xl ${bountyTone}`}>x{card.bountyMultiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={`mt-4 flex flex-wrap items-center gap-3 text-sm ${infoTone}`}>
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em] ${infoBadgeTone}`}>
          🎁 {t('home:card.rewardCompact', { amount: numberFormatter.format(Math.max(card.pool * 0.05, 50)) })} TAI
        </div>
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em] ${infoBadgeTone}`}>
          {t('home:card.liveOdds')} <span className="font-mono text-sm text-emerald-300">{card.yesOdds.toFixed(2)}x</span> /
          <span className="font-mono text-sm text-cyan-300">{card.noOdds.toFixed(2)}x</span>
        </div>
        <JurorRewardBadge reward={card.jurorRewardTai ?? Math.max(card.pool * 0.01, 100)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setQuickBet({ side: 'yes' });
          }}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${betButtonTone}`}
        >
          💰 {t('home:card.betYesCompact')}
          <span className="font-mono text-xs">{card.yesOdds.toFixed(2)}x</span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setQuickBet({ side: 'no' });
          }}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${betButtonToneNo}`}
        >
          💰 {t('home:card.betNoCompact')}
          <span className="font-mono text-xs">{card.noOdds.toFixed(2)}x</span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/market/${card.id}`);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-emerald-200/40"
        >
          📄 {t('home:card.viewDetail')}
        </button>
      </div>

      <Confetti active={celebrate} delayMs={100} />
      <QuickBetModal
        open={Boolean(quickBet)}
        marketId={card.id}
        marketTitle={card.title}
        side={quickBet?.side ?? 'yes'}
        odds={quickBet?.side === 'no' ? card.noOdds : card.yesOdds}
        onClose={() => setQuickBet(null)}
        onSuccess={() => setCelebrate(true)}
      />
    </article>
  );
}
