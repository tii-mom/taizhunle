/**
 * 玻璃质感市场卡片
 */
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { CountUp } from './CountUp';
import { CountDown } from './CountDown';
import { GoldenHammer } from './GoldenHammer';
import type { MarketCard } from '../../services/markets';

type MarketCardGlassProps = {
  card: MarketCard;
};

export function MarketCardGlass({ card }: MarketCardGlassProps) {
  const navigate = useNavigate();
  const participants = card.bets.length;
  const progress = Math.min((card.pool / card.targetPool) * 100, 100);
  const showEntities = card.entities.slice(0, 3);
  const isLive = card.filter === 'live';
  const hammerLevel = card.juryCount >= 5 ? 'gold' : card.juryCount >= 3 ? 'silver' : card.juryCount > 0 ? 'bronze' : 'gray';

  return (
    <GlassCard
      onClick={() => navigate(`/detail/${card.id}`)}
      className="p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {showEntities.map((entity) => (
              <span key={entity} className="glass-chip">
                {entity}
              </span>
            ))}
            <span className="glass-badge uppercase text-amber-100/70">{isLive ? 'Live' : 'Settled'}</span>
          </div>
          <h3 className="line-clamp-1 text-xl font-semibold tracking-wide text-amber-100 drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]">
            {card.title}
          </h3>
        </div>
        <GoldenHammer count={card.juryCount} level={hammerLevel} />
      </div>

      <div className="mt-4 grid gap-4 text-sm text-slate-200 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-300/60">奖池</span>
              <div className="flex items-end gap-1">
                <CountUp end={card.pool} className="font-mono text-2xl font-semibold text-amber-200" />
                <span className="pb-1 text-sm text-amber-100/80">TAI</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-300/60">实时赔率</span>
              <p className="font-mono text-xl font-semibold text-emerald-200">{card.odds}</p>
            </div>
          </div>
          <div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-300/60">
              <span>奖池目标 {card.targetPool.toLocaleString()} TAI</span>
              <span>{participants} 人参与</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-[0.35em] text-slate-300/60">终局倒计时</span>
            <CountDown endTime={card.endsAt} className="text-base" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs">
            <p className="font-semibold text-amber-200">高赏金 x{card.bountyMultiplier.toFixed(1)}</p>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-200/60">glass dao pool</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
