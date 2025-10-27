import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useOfficialRain } from '../hooks/useOfficialRain';
import { CountdownBar } from '../components/redpacket/CountdownBar';
import { QualifyBadge } from '../components/redpacket/QualifyBadge';
import { useHaptic } from '../hooks/useHaptic';
import { formatTON, formatTAI } from '../utils/format';

export function OfficialRain() {
  const { t } = useTranslation('redpacket');
  const { data: rainStatus, isLoading } = useOfficialRain();
  const { vibrate } = useHaptic();

  const handleClaim = () => {
    vibrate(10);
    // TODO: Implement claim logic
    window.alert(t('official.claimAlert'));
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

          <button
            type="button"
            onClick={handleClaim}
            disabled={!rainStatus.qualify}
            className="group relative w-full overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-accent to-accent-light p-6 text-center shadow-lg transition-all hover:shadow-accent/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-2">
              <p className="text-sm font-medium text-accent-contrast/80">
                {t('official.ticketLabel')}
              </p>
              <p className="font-mono text-2xl font-bold text-accent-contrast">
                {formatTON(rainStatus.ticketPrice)} TON
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl ring-2 ring-accent/50 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

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
