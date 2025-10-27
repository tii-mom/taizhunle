import { useTranslation } from 'react-i18next';
import { PageLayout } from '../components/layout/PageLayout';
import { useRedPacketSale } from '../hooks/useRedPacketSale';
import { PriceButton } from '../components/redpacket/PriceButton';
import { CountdownBar } from '../components/redpacket/CountdownBar';
import { AccelerateBadge } from '../components/redpacket/AccelerateBadge';
import { PriceAdjustmentBanner } from '../components/redpacket/PriceAdjustmentBanner';
import { SoldOutOverlay } from '../components/redpacket/SoldOutOverlay';
import { ProgressStats } from '../components/redpacket/ProgressStats';

export function RedPacketSale() {
  const { t } = useTranslation('redpacket');
  const { data: saleStatus, isLoading } = useRedPacketSale();

  const handleBuy = () => {
    // TODO: Implement buy logic
    window.alert(t('sale.buyAlert'));
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

          <PriceButton
            priceTON={saleStatus.priceTON}
            label={t('sale.priceLabel')}
            disabled={saleStatus.soldOut}
            onClick={handleBuy}
          />

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
        </div>
      </div>
    </PageLayout>
  );
}
