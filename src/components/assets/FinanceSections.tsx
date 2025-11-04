import clsx from 'clsx';
import { Gift, PartyPopper } from 'lucide-react';

import { useAssetData } from '../../hooks/useAssetData';
import { useHaptic } from '../../hooks/useHaptic';
import { formatNumber } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { AuroraPanel } from '../glass/AuroraPanel';
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

  const isLight = mode === 'light';
  const labelTone = isLight ? 'text-slate-500' : 'text-white/60';
  const primaryTone = isLight ? 'text-slate-900' : 'text-white';

  return (
    <div className="space-y-4">
      <AuroraPanel variant="amber" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Gift size={20} className={isLight ? 'text-amber-500' : 'text-amber-200'} />
          <h2 className={clsx('text-lg font-semibold', primaryTone)}>{t('myRedPacket')}</h2>
        </div>
        {totalRedPacket === 0 ? (
          <div
            className={clsx(
              'rounded-2xl border px-4 py-3 text-sm shadow-inner',
              isLight ? 'border-slate-200 bg-white/90 text-slate-500' : 'border-white/10 bg-white/5 text-white/60',
            )}
          >
            {t('noRedPacket', '暂无红包')}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={clsx('text-sm', labelTone)}>{t('redPacketClaimed')}</span>
              <span className={clsx('font-mono text-lg font-semibold', primaryTone)}>
                {formatNumber(animatedClaimed, 0)} / {formatNumber(totalRedPacket, 0)}
              </span>
            </div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${Math.min(100, (claimedRedPacket / totalRedPacket) * 100)}%` }} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => vibrate()}
                className={clsx(
                  'glass-button-secondary flex-1 justify-center',
                  isLight && '!border-slate-200 !bg-white/90 !text-slate-600 hover:!text-slate-800',
                )}
              >
                {t('claimRedPacket')}
              </button>
              <button type="button" onClick={() => vibrate()} className="glass-button-primary flex-1 justify-center">
                {t('redeemAll', '一键领取')}
              </button>
            </div>
          </div>
        )}
      </AuroraPanel>

      <AuroraPanel variant="neutral" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PartyPopper size={20} className={isLight ? 'text-amber-500' : 'text-amber-200'} />
            <div>
              <h2 className={clsx('text-lg font-semibold', primaryTone)}>{t('globalPacket', '全局红包池')}</h2>
              <p className={clsx('text-xs uppercase tracking-[0.35em]', isLight ? 'text-slate-400' : 'text-white/50')}>
                {t('globalPacketHint', '实时刷新 · 5 秒')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('globalPool', '当前奖池')}</p>
            <CountUp
              end={poolCount}
              className={clsx('font-mono text-2xl font-bold', isLight ? 'text-amber-500' : 'text-amber-200')}
              suffix=" TAI"
            />
          </AuroraPanel>
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('packetPrice', '红包价格')}</p>
            <p className={clsx('font-mono text-2xl font-bold', primaryTone)}>
              {formatNumber(globalRedPacket.price, 2)} TON
            </p>
          </AuroraPanel>
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('buyers', '参与人数')}</p>
            <p className={clsx('font-mono text-xl font-semibold', primaryTone)}>
              {globalRedPacket.buyers.toLocaleString()}
            </p>
          </AuroraPanel>
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('limit', '单人限购')}</p>
            <p className={clsx('font-mono text-xl font-semibold', primaryTone)}>
              {globalRedPacket.limit} {t('packs', '份')}
            </p>
          </AuroraPanel>
        </div>

        <button type="button" onClick={() => vibrate()} className="glass-button-primary w-full justify-center">
          {t('buyNow', '立即抢购')}
        </button>
      </AuroraPanel>
    </div>
  );
}
