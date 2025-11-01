import { Gift, PartyPopper } from 'lucide-react';

import { useAssetData } from '../../hooks/useAssetData';
import { useHaptic } from '../../hooks/useHaptic';
import { formatNumber } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { GlassCard } from '../glass/GlassCard';
import { GoldenHammer } from '../glass/GoldenHammer';
import { CountUp } from '../glass/CountUp';

export function FinanceSections() {
  const { t } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const { redPackets, globalRedPacket } = useAssetData();

  const totalRedPacket = redPackets?.total || 0;
  const claimedRedPacket = redPackets?.claimed || 0;
  const animatedClaimed = useCountUp(claimedRedPacket);
  const poolCount = useCountUp(globalRedPacket.totalPool);

  const labelTone = mode === 'light' ? 'text-slate-600' : 'text-white/60';

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <Gift size={20} className="text-amber-200" />
          <h2 className="text-lg font-semibold text-white">{t('myRedPacket')}</h2>
          <GoldenHammer count={Math.round(totalRedPacket / 5)} level={totalRedPacket > 50 ? 'gold' : 'bronze'} />
        </div>
        {totalRedPacket === 0 ? (
          <div className="glass-card-sm p-4 text-sm text-white/60">{t('noRedPacket', '暂无红包')}</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${labelTone}`}>{t('redPacketClaimed')}</span>
              <span className="font-mono text-lg font-semibold text-white">
                {formatNumber(animatedClaimed, 0)} / {formatNumber(totalRedPacket, 0)}
              </span>
            </div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${(claimedRedPacket / totalRedPacket) * 100}%` }} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => vibrate()}
                className="glass-button-secondary flex-1 justify-center"
              >
                {t('claimRedPacket')}
              </button>
              <button
                type="button"
                onClick={() => vibrate()}
                className="glass-button-primary flex-1 justify-center"
              >
                {t('redeemAll', '一键领取')}
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PartyPopper size={20} className="text-amber-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">{t('globalPacket', '全局红包池')}</h2>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('globalPacketHint', '实时刷新 · 5 秒')}</p>
            </div>
          </div>
          <GoldenHammer count={globalRedPacket.buyers} level={globalRedPacket.buyers > 2000 ? 'gold' : 'silver'} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card-sm space-y-2 p-4">
            <p className="text-xs text-white/60">{t('globalPool', '当前奖池')}</p>
            <CountUp end={poolCount} className="font-mono text-2xl font-bold text-amber-200" suffix=" TAI" />
          </div>
          <div className="glass-card-sm space-y-2 p-4">
            <p className="text-xs text-white/60">{t('packetPrice', '红包价格')}</p>
            <p className="font-mono text-2xl font-bold text-white">{formatNumber(globalRedPacket.price, 2)} TON</p>
          </div>
          <div className="glass-card-sm space-y-2 p-4">
            <p className="text-xs text-white/60">{t('buyers', '参与人数')}</p>
            <p className="font-mono text-xl font-semibold text-white">{globalRedPacket.buyers.toLocaleString()}</p>
          </div>
          <div className="glass-card-sm space-y-2 p-4">
            <p className="text-xs text-white/60">{t('limit', '单人限购')}</p>
            <p className="font-mono text-xl font-semibold text-white">{globalRedPacket.limit} {t('packs', '份')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => vibrate()}
          className="glass-button-primary w-full justify-center"
        >
          {t('buyNow', '立即抢购')}
        </button>
      </GlassCard>
    </div>
  );
}
