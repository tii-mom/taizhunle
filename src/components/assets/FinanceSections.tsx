import { useTranslation } from 'react-i18next';
import { Gift, TrendingUp, ChevronRight } from 'lucide-react';
import { useAssetData } from '../../hooks/useAssetData';
import { useHaptic } from '../../hooks/useHaptic';
import { EmptyState } from '../common/EmptyState';
import { formatNumber } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';

export function FinanceSections() {
  const { t } = useTranslation('assets');
  const { vibrate } = useHaptic();
  const { redPackets, predictions } = useAssetData();

  const totalRedPacket = redPackets?.total || 0;
  const claimedRedPacket = redPackets?.claimed || 0;
  const animatedClaimed = useCountUp(claimedRedPacket);

  const winRate = predictions?.winRate || 0;
  const totalProfit = predictions?.totalProfit || 0;
  const animatedProfit = useCountUp(totalProfit);

  return (
    <div className="space-y-4">
      {/* 我的红包 */}
      <section className="rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <Gift size={20} className="text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">{t('myRedPacket')}</h2>
        </div>
        {totalRedPacket === 0 ? (
          <EmptyState type="redPacket" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{t('redPacketClaimed')}</span>
              <span className="font-mono text-lg font-semibold text-text-primary">
                {formatNumber(animatedClaimed, 0)} / {formatNumber(totalRedPacket, 0)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
                style={{ width: `${(claimedRedPacket / totalRedPacket) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => vibrate()}
              className="w-full rounded-xl border border-border-light bg-surface-glass/60 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
            >
              {t('claimRedPacket')}
            </button>
          </div>
        )}
      </section>

      {/* 历史预测 */}
      <section className="rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">{t('myHistory')}</h2>
          </div>
          <button
            type="button"
            onClick={() => vibrate()}
            className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-light"
          >
            {t('viewHistory')}
            <ChevronRight size={16} />
          </button>
        </div>
        {!predictions || predictions.total === 0 ? (
          <EmptyState type="market" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">{t('winRate')}</p>
              <p className="font-mono text-2xl font-bold text-text-primary">{formatNumber(winRate, 1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">{t('totalProfit')}</p>
              <p className="font-mono text-2xl font-bold text-success">+{formatNumber(animatedProfit, 2)}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
