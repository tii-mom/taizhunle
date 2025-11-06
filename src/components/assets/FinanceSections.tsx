import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Gift, PartyPopper, ShieldCheck } from 'lucide-react';
import { useTonWallet } from '@tonconnect/ui-react';
import { useQueryClient } from '@tanstack/react-query';

import { useAssetData } from '../../hooks/useAssetData';
import { useHaptic } from '../../hooks/useHaptic';
import { formatNumber } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { AuroraPanel } from '../glass/AuroraPanel';
import { CountUp } from '../glass/CountUp';
import { useWhitelistQuota, useWhitelistStatus, whitelistStatusQueryKey } from '../../queries/whitelist';
import { GlassModalGlass } from '../glass/GlassModalGlass';
import { useWhitelistPurchase } from '../../hooks/useWhitelistPurchase';

export function FinanceSections() {
  const { t } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const { redPackets, globalRedPacket } = useAssetData();
  const { data: whitelistStatus } = useWhitelistStatus();
  const wallet = useTonWallet();
  const walletAddress = wallet?.account?.address;
  const { data: whitelistQuota, isLoading: isQuotaLoading } = useWhitelistQuota(walletAddress ?? undefined);
  const [whitelistModalOpen, setWhitelistModalOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const {
    submitPurchase,
    phase: purchasePhase,
    error: purchaseError,
    controllerConfigured,
    openWalletModal,
    reset: resetPurchase,
  } = useWhitelistPurchase();
  const queryClient = useQueryClient();

  const totalRedPacket = redPackets?.total || 0;
  const claimedRedPacket = redPackets?.claimed || 0;
  const animatedClaimed = useCountUp(claimedRedPacket);
  const poolCount = useCountUp(globalRedPacket.totalPool);

  const isLight = mode === 'light';
  const labelTone = isLight ? 'text-slate-500' : 'text-white/60';
  const primaryTone = isLight ? 'text-slate-900' : 'text-white';
  const maxQuota = whitelistQuota?.quota ?? 0;
  const saleActive = whitelistStatus?.active ?? false;
  const purchaseDisabled = purchasePhase === 'awaitingWallet';

  const quotaHint = useMemo(() => {
    if (!controllerConfigured) {
      return t('whitelistModal.controllerMissing', '未配置白名单合约地址，请联系管理员。');
    }
    if (!saleActive) {
      return t('whitelistModal.inactive', '当前未开放认购窗口，请等待下一轮。');
    }
    return null;
  }, [controllerConfigured, saleActive, t]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setPurchaseAmount(sanitized);
  };

  const handleQuickFill = (value: number) => {
    const capped = Math.min(value, maxQuota);
    setPurchaseAmount(capped > 0 ? String(capped) : '');
  };

  const handlePurchase = async () => {
    setPurchaseMessage(null);
    if (!controllerConfigured) {
      setPurchaseMessage({ type: 'error', text: t('whitelistModal.controllerMissing', '未配置白名单合约地址，请联系管理员。') });
      return;
    }

    if (!walletAddress) {
      openWalletModal();
      setPurchaseMessage({ type: 'error', text: t('whitelistModal.connectFirst', '请先连接钱包。') });
      return;
    }

    const amount = Number.parseInt(purchaseAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPurchaseMessage({ type: 'error', text: t('whitelistModal.invalidAmount', '请输入有效的认购数量。') });
      return;
    }

    if (amount > maxQuota) {
      setPurchaseMessage({ type: 'error', text: t('whitelistModal.exceedsQuota', '超出可认购额度。') });
      return;
    }

    if (!whitelistQuota?.proof) {
      setPurchaseMessage({ type: 'error', text: t('whitelistModal.noProof', '未找到 Proof') });
      return;
    }

    try {
      await submitPurchase({ amount, quota: maxQuota, proof: whitelistQuota.proof });
      setPurchaseMessage({ type: 'success', text: t('whitelistModal.success', '提交成功，请在钱包中确认交易并等待链上确认。') });
      setPurchaseAmount('');
      resetPurchase();
      await queryClient.invalidateQueries({ queryKey: ['whitelist', 'quota', walletAddress] });
      await queryClient.invalidateQueries({ queryKey: whitelistStatusQueryKey });
    } catch (err) {
      if (err instanceof Error && err.message === 'wallet-not-connected') {
        return;
      }

      const message = purchaseError || (err instanceof Error ? err.message : t('whitelistModal.genericError', '提交失败，请稍后再试。'));
      setPurchaseMessage({ type: 'error', text: message });
    }
  };

  return (
    <>
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
            <ShieldCheck size={20} className={isLight ? 'text-emerald-500' : 'text-emerald-200'} />
            <div>
              <h2 className={clsx('text-lg font-semibold', primaryTone)}>{t('whitelistTitle', '质押白名单')}</h2>
              <p className={clsx('text-xs uppercase tracking-[0.35em]', labelTone)}>
                {whitelistStatus?.active
                  ? t('whitelistActive', '窗口进行中')
                  : t('whitelistInactive', '待下一轮解锁')}
              </p>
            </div>
          </div>
          <div className={clsx('rounded-full border px-3 py-1 text-xs', labelTone)}>
            {t('whitelistRemaining', {
              remaining: formatNumber(whitelistStatus?.remaining ?? 0, 0),
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('whitelistBaseline', '上一轮价格')}</p>
            <p className={clsx('font-mono text-xl font-semibold', primaryTone)}>
              {formatNumber(whitelistStatus?.baselinePrice ?? 0, 2)} TON
            </p>
          </AuroraPanel>
          <AuroraPanel variant="neutral" className="rounded-2xl border border-white/15 px-4 py-3 text-sm">
            <p className={clsx('text-xs', labelTone)}>{t('whitelistCurrent', '当前估值')}</p>
            <p className={clsx('font-mono text-xl font-semibold', primaryTone)}>
              {formatNumber(whitelistStatus?.currentPrice ?? 0, 2)} TON
            </p>
          </AuroraPanel>
        </div>

        <p className={clsx('text-xs', labelTone)}>
          {t('whitelistHint', '质押越久越多折扣额度，认购窗开启 72 小时。')}
        </p>

        <button
          type="button"
          onClick={() => {
            vibrate();
            setWhitelistModalOpen(true);
          }}
          className="glass-button-primary w-full justify-center"
        >
          {t('whitelistCta', '查看我的认购配额')}
        </button>
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

    <GlassModalGlass
      open={whitelistModalOpen}
      title={t('whitelistModal.title', '质押白名单')}
      description={t('whitelistModal.subtitle', '可认购额度与 Proof 信息')}
      onClose={() => {
        setWhitelistModalOpen(false);
        setPurchaseAmount('');
        setPurchaseMessage(null);
        resetPurchase();
      }}
    >
      {!walletAddress ? (
        <p className={clsx('rounded-2xl border px-4 py-3 text-sm', labelTone)}>
          {t('whitelistModal.connect', '请先连接 TON 钱包以查看认购额度。')}
        </p>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">
            <p className={clsx('text-xs uppercase tracking-[0.3em]', labelTone)}>{t('whitelistModal.wallet', '钱包地址')}</p>
            <p className={clsx('mt-1 font-mono text-sm', primaryTone)}>{walletAddress}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">
            <p className={clsx('text-xs uppercase tracking-[0.3em]', labelTone)}>{t('whitelistModal.quota', '可认购额度')}</p>
            <p className={clsx('mt-1 font-mono text-lg font-semibold', primaryTone)}>
              {isQuotaLoading
                ? '...'
                : formatNumber(whitelistQuota?.quota ?? 0, 0)}{' '}
              TAI
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">
            <p className={clsx('text-xs uppercase tracking-[0.3em]', labelTone)}>{t('whitelistModal.proof', 'Merkle Proof (Base64)')}</p>
            <p className={clsx('mt-1 break-all text-[11px]', primaryTone)}>
              {isQuotaLoading ? '...' : whitelistQuota?.proof ?? t('whitelistModal.noProof', '未找到 Proof')}
            </p>
          </div>

          <div className={clsx('rounded-2xl border border-white/15 bg-white/8 px-4 py-3 space-y-3')}>
            <div className="flex items-center justify-between">
              <p className={clsx('text-xs uppercase tracking-[0.3em]', labelTone)}>{t('whitelistModal.amount', '认购数量')}</p>
              <span className={clsx('text-xs', labelTone)}>
                {t('whitelistModal.remaining', { remaining: formatNumber(maxQuota, 0) })}
              </span>
            </div>
            <input
              value={purchaseAmount}
              onChange={event => handleAmountChange(event.target.value)}
              inputMode="numeric"
              placeholder={t('whitelistModal.amountPlaceholder', '输入 TAI 数量')}
              className={clsx(
                'w-full rounded-xl border px-4 py-2 font-mono text-base outline-none transition',
                isLight
                  ? 'border-slate-200 bg-white/95 text-slate-800 focus:border-slate-400'
                  : 'border-white/15 bg-white/5 text-white focus:border-white/40',
              )}
            />
            <div className="flex flex-wrap gap-2 text-xs">
              {[1000, 5000, 10000, 50000].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickFill(value)}
                  className={clsx(
                    'rounded-full border px-3 py-1 transition',
                    isLight
                      ? 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                      : 'border-white/15 bg-white/10 text-white/70 hover:border-white/30 hover:text-white',
                  )}
                >
                  {value.toLocaleString()} TAI
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickFill(maxQuota)}
                className={clsx(
                  'rounded-full border px-3 py-1 transition',
                  isLight
                    ? 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                    : 'border-white/15 bg-white/10 text-white/70 hover:border-white/30 hover:text-white',
                )}
              >
                {t('whitelistModal.max', '全部')}
              </button>
            </div>
            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchaseDisabled || !saleActive}
              className={clsx(
                'glass-button-primary w-full justify-center',
                (purchaseDisabled || !saleActive) && 'pointer-events-none opacity-60',
              )}
            >
              {purchasePhase === 'awaitingWallet'
                ? t('whitelistModal.awaitingWallet', '请在钱包中确认...')
                : t('whitelistModal.confirm', '提交认购交易')}
            </button>
            {purchaseMessage && (
              <p
                className={clsx(
                  'text-xs',
                  purchaseMessage.type === 'success'
                    ? isLight
                      ? 'text-emerald-600'
                      : 'text-emerald-200'
                    : isLight
                      ? 'text-rose-600'
                      : 'text-rose-200',
                )}
              >
                {purchaseMessage.text}
              </p>
            )}
            {quotaHint && (
              <p className={clsx('text-xs', labelTone)}>{quotaHint}</p>
            )}
          </div>

          <p className={clsx('text-xs', labelTone)}>
            {t('whitelistModal.hint', '复制 Proof 后，可在 TonConnect 交易内粘贴，完成 PurchaseWhitelist 调用。')}
          </p>
        </div>
      )}
    </GlassModalGlass>
    </>
  );
}
