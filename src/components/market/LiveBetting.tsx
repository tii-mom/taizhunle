import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { useLiveBetting } from '../../hooks/useLiveBetting';
import { useCountUp } from '../../hooks/useCountUp';
import { formatTAI } from '../../utils/format';

type Props = {
  marketId: string;
};

export function LiveBetting({ marketId }: Props) {
  const { t } = useTranslation('market');
  const { data: liveStats, isLoading } = useLiveBetting(marketId);

  const animatedVolume = useCountUp(liveStats?.totalVolume ?? 0);
  const animatedBets = useCountUp(liveStats?.totalBets ?? 0);
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
            <span>{t('live.totalBets')}</span>
          </div>
          <p className="font-mono text-lg font-semibold text-text-primary">
            {Math.floor(animatedBets).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1 rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <TrendingUp className="h-3 w-3" />
            <span>{t('live.volume')}</span>
          </div>
          <p className="font-mono text-lg font-semibold text-accent">
            {formatTAI(animatedVolume)}
          </p>
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

      {/* Recent Bets Marquee */}
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
    </div>
  );
}
