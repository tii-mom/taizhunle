import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { useLiveBetting } from '../../hooks/useLiveBetting';
import { useCountUp } from '../../hooks/useCountUp';
import { formatTAI } from '../../utils/format';

type Props = {
  marketId: string;
  variant?: 'expanded' | 'compact';
};

export function LiveBetting({ marketId, variant = 'compact' }: Props) {
  const { t } = useTranslation('market');
  const { data: liveStats, isLoading } = useLiveBetting(marketId);

  const animatedInviteRewards = useCountUp(liveStats?.inviteRewards ?? 0);
  const animatedMaxBet = useCountUp(liveStats?.maxSingleBet ?? 0);
  const animatedBettors = useCountUp(liveStats?.uniqueBettors ?? 0);

  if (isLoading || !liveStats) {
    return (
      <div className="space-y-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        <div className="h-4 w-32 animate-pulse rounded bg-border" />
        <div className="h-20 animate-pulse rounded bg-border" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1 rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Activity className="h-3 w-3" />
            <span>{t('live.inviteRewards')}</span>
          </div>
          <p className="font-mono text-lg font-semibold text-accent">
            {formatTAI(animatedInviteRewards)}
          </p>
        </div>

        <div className="space-y-1 rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <TrendingUp className="h-3 w-3" />
            <span>{t('live.maxSingleBet')}</span>
          </div>
          <div className="space-y-0.5">
            <p className="font-mono text-lg font-semibold text-text-primary">
              {formatTAI(animatedMaxBet)}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {liveStats?.maxBetUser}
            </p>
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Users className="h-3 w-3" />
            <span>{t('live.bettors')}</span>
          </div>
          <p className="font-mono text-lg font-semibold text-text-primary">
            {Math.floor(animatedBettors).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Bets */}
      {variant === 'expanded' ? (
        // 详情页：高级精美卡片UI
        <div className="overflow-hidden rounded-xl border border-border-light bg-gradient-to-r from-surface-glass/80 to-surface-glass/60 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {t('live.recentBets')}
            </p>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
          </div>
          
          <div className="space-y-2">
            {liveStats.recentBets.slice(0, 3).map((bet, index) => (
              <div
                key={bet.id}
                className={`flex items-center justify-between rounded-lg border border-border-light/50 bg-background/40 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-background/60 ${
                  index === 0 ? 'ring-1 ring-accent/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-accent/20 to-accent-light/20 text-xs font-semibold text-accent">
                    {bet.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{bet.user}</p>
                    <p className="text-xs text-text-secondary">
                      {Math.floor((Date.now() - bet.timestamp) / 60000)}{t('live.minutesAgo')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    bet.side === 'yes' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {bet.side === 'yes' ? '↗' : '↘'}
                    {bet.side === 'yes' ? t('yes') : t('no')}
                  </span>
                  <span className="font-mono text-sm font-bold text-accent">
                    {formatTAI(bet.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* 底部渐变效果 */}
          <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-accent/30 via-accent-light/50 to-accent/30" />
        </div>
      ) : (
        // 首页：滚动展示
        <div className="overflow-hidden rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {t('live.recentBets')}
          </p>
          <div className="flex animate-marquee gap-6 whitespace-nowrap text-sm text-text-secondary">
            {liveStats.recentBets.map((bet) => (
              <span key={bet.id} className="inline-flex items-center gap-2">
                <span className="font-semibold text-text-primary">{bet.user}</span>
                <span className={bet.side === 'yes' ? 'text-green-500' : 'text-red-500'}>
                  {bet.side === 'yes' ? '↑' : '↓'}
                </span>
                <span className="font-mono text-accent">{formatTAI(bet.amount)} TAI</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
