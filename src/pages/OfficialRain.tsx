import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useOfficialRain } from '../hooks/useOfficialRain';
import { CountdownBar } from '../components/redpacket/CountdownBar';
import { QualifyBadge } from '../components/redpacket/QualifyBadge';
import { useHaptic } from '../hooks/useHaptic';
import { formatTON, formatTAI } from '../utils/format';
import { useOfficialRainClaim } from '../hooks/useOfficialRainClaim';

export function OfficialRain() {
  const { t } = useTranslation('redpacket');
  const { data: rainStatus, isLoading } = useOfficialRain();
  const { vibrate } = useHaptic();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const {
    mutateAsync: claimRain,
    isPending: isClaiming,
  } = useOfficialRainClaim();

  const handleClaim = () => {
    vibrate(10);
    const rawAddress = wallet?.account?.address;

    if (!rawAddress) {
      if (tonConnectUI?.openModal) {
        tonConnectUI.openModal();
      }
      window.alert(t('official.connectWallet'));
      return;
    }

    claimRain({ wallet: rawAddress })
      .then(async result => {
        if (!tonConnectUI) {
          throw new Error('ton-connect-unavailable');
        }

        const validUntil = Math.floor(Date.now() / 1000) + 300;
        await tonConnectUI.sendTransaction({
          validUntil,
          boc: result.unsignedBoc,
        });

        const amount = formatTAI(result.amount);
        const message = result.qualified
          ? t('official.claimSuccess', { amount })
          : t('official.claimSuccessLimited', { amount });
        window.alert(message);
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : t('official.claimError');
        window.alert(message);
      });
  };

  if (isLoading || !rainStatus) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
        </div>
      </PageLayout>
    );
  }

  const requirements = [
    t('official.requirements.purchased'),
    t('official.requirements.active'),
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text-primary">{t('official.title')}</h1>
          <p className="text-text-secondary">{t('official.subtitle')}</p>
        </header>

          <div className="space-y-6 rounded-xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-lg">
          <div className="space-y-4 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center backdrop-blur-sm">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent/20 p-4">
                <Ticket className="h-8 w-8 text-accent" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">{t('official.amountLabel')}</p>
              <p className="font-mono text-4xl font-bold text-accent">
                {formatTAI(rainStatus.amountTAI)} TAI
              </p>
            </div>
            <p className="text-sm text-text-secondary">
              {t('official.remaining', { count: rainStatus.remaining })}
            </p>
          </div>

          <CountdownBar
            targetTimestamp={rainStatus.nextAt}
            label={t('official.nextLabel')}
          />

          <QualifyBadge qualify={rainStatus.qualify} requirements={requirements} />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TonConnectButton className="md:w-auto" />
            <button
              type="button"
              onClick={handleClaim}
              disabled={!rainStatus.qualify || isClaiming}
              className="group relative w-full overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-accent to-accent-light p-6 text-center shadow-lg transition-all hover:shadow-accent/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[220px]"
            >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-2">
              <p className="text-sm font-medium text-accent-contrast/80">
                {t('official.ticketLabel')}
              </p>
              <p className="font-mono text-2xl font-bold text-accent-contrast">
                {isClaiming ? t('official.claiming') : `${formatTON(rainStatus.ticketPrice)} TON`}
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-accent/50 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>

          <div className="rounded-xl border border-border-light bg-background/40 p-4">
            <p className="text-center text-sm text-text-secondary">
              {t('official.notice')}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
