import { useTranslation } from 'react-i18next';
import { TonConnectButton } from '@tonconnect/ui-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useRedPacketSale } from '../hooks/useRedPacketSale';
import { PriceButton } from '../components/redpacket/PriceButton';
import { CountdownBar } from '../components/redpacket/CountdownBar';
import { AccelerateBadge } from '../components/redpacket/AccelerateBadge';
import { PriceAdjustmentBanner } from '../components/redpacket/PriceAdjustmentBanner';
import { SoldOutOverlay } from '../components/redpacket/SoldOutOverlay';
import { ProgressStats } from '../components/redpacket/ProgressStats';
import { useRedPacketPurchase } from '../hooks/useRedPacketPurchase';
import { formatTAI } from '../utils/format';

export function RedPacketSale() {
  const { t } = useTranslation('redpacket');
  const { data: saleStatus, isLoading } = useRedPacketSale();
  const {
    phase,
    error,
    result,
    isProcessing,
    startPurchase,
    wallet,
    openWalletModal,
    sessionMemo,
  } = useRedPacketPurchase();

  const handleBuy = () => {
    if (!wallet?.account?.address) {
      openWalletModal();
    }

    void startPurchase().catch(err => {
      if (err instanceof Error) {
        const key = err.message === 'payment-timeout' ? 'sale.purchaseTimeout' : 'sale.buyError';
        window.alert(t(key));
      }
    });
  };

  if (isLoading || !saleStatus) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text-primary">{t('sale.title')}</h1>
          <p className="text-text-secondary">{t('sale.subtitle')}</p>
        </header>

        <div className="relative space-y-6 rounded-xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-lg">
          <SoldOutOverlay visible={saleStatus.soldOut} message={t('sale.soldOut')} />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TonConnectButton className="md:w-auto" />
            <PriceButton
              priceTON={saleStatus.priceTON}
              label={t('sale.priceLabel')}
              disabled={saleStatus.soldOut || isProcessing}
              onClick={handleBuy}
            />
          </div>

          <CountdownBar
            targetTimestamp={saleStatus.countdown}
            label={t('sale.countdownLabel')}
          />

          <AccelerateBadge
            active={saleStatus.accelerate}
            normalRate={5}
            accelerateRate={10}
            timeRange={t('sale.accelerateTime')}
          />

          <PriceAdjustmentBanner adjustment={saleStatus.priceAdjustment} />

          <ProgressStats
            soldTAI={saleStatus.soldTAI}
            totalTAI={saleStatus.totalTAI}
            label={t('sale.progressLabel')}
          />

          <div className="grid gap-4 rounded-xl border border-border-light bg-background/40 p-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-secondary">
                {t('sale.stats.base')}
              </p>
              <p className="font-mono text-lg font-semibold text-text-primary">
                {(saleStatus.totalTAI * 0.7).toLocaleString()} TAI
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-secondary">
                {t('sale.stats.max')}
              </p>
              <p className="font-mono text-lg font-semibold text-text-primary">
                {(saleStatus.totalTAI * 1.3).toLocaleString()} TAI
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-secondary">
                {t('sale.stats.split')}
              </p>
              <p className="font-mono text-lg font-semibold text-accent">
                {saleStatus.accelerate ? '10%' : '5%'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-light bg-background/60 p-4 text-sm text-text-secondary">
            <p>
              {phase === 'preparing' && t('sale.status.preparing')}
              {phase === 'awaitingWallet' && t('sale.status.awaitingWallet')}
              {phase === 'waitingConfirmation' &&
                t('sale.status.waitingConfirmation', { memo: sessionMemo ?? '-' })}
              {phase === 'awaitingDistribution' &&
                t('sale.status.awaitingDistribution', {
                  amount: result
                    ? t('sale.status.amount', { amount: formatTAI(result.amountTAI) })
                    : '--',
                })}
              {phase === 'completed' &&
                t('sale.status.completed', {
                  amount: result
                    ? t('sale.status.amount', { amount: formatTAI(result.amountTAI) })
                    : '--',
                })}
              {phase === 'error' && (error ? error : t('sale.status.error'))}
              {phase === 'idle' && t('sale.status.idle')}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
