import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InviteSummary } from '../components/invite/InviteSummary';
import { InviteRewards } from '../components/invite/InviteRewards';
import { InviteHistory } from '../components/invite/InviteHistory';
import { PageLayout } from '../components/layout/PageLayout';
import { useHaptic } from '../hooks/useHaptic';

type HistoryEntry = {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
};

export function Invite() {
  const { t } = useTranslation(['invite', 'history']);
  const { vibrate } = useHaptic();
  const tiers = useMemo(() => (t('invite:rewards.tiers', { returnObjects: true }) as string[]) ?? [], [t]);
  const logs = useMemo(
    () => (t('history:records', { returnObjects: true }) as HistoryEntry[] | undefined) ?? [],
    [t],
  );
  
  const handleWithdraw = () => {
    vibrate(10);
    window.alert(t('invite:toasts.withdraw'));
  };

  return (
    <PageLayout>
      <div className="space-y-6 pb-32 lg:pb-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text-primary">{t('invite:title')}</h1>
          <p className="text-text-secondary">{t('invite:subtitle')}</p>
        </header>
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <InviteSummary
              stats={(t('invite:summary.stats', { returnObjects: true }) as string[]) ?? []}
              buttonLabel={t('invite:actions.copy')}
              code={t('invite:summary.code')}
              onCopy={() => window.alert(t('invite:toasts.copied'))}
            />
            <InviteRewards tiers={tiers} highlight={t('invite:rewards.highlight')} note={t('invite:rewards.note')} />
            <InviteHistory
              heading={t('history:heading')}
              columns={(t('history:columns', { returnObjects: true }) as string[]) ?? []}
              empty={t('history:empty')}
              records={logs}
              appealLabel={t('history:appeal')}
              onAppeal={() => window.alert(t('history:appealNotice'))}
            />
          </div>
          <aside className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-text-primary">{t('invite:withdraw.heading')}</h2>
            <p className="text-sm text-text-secondary">{t('invite:withdraw.description')}</p>
            <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-wide text-text-secondary">{t('invite:withdraw.note')}</p>
              <p className="mt-2 font-mono text-3xl font-bold text-accent shadow-accent/50 dark:shadow-accent/30">{t('invite:withdraw.balance')}</p>
            </div>
            <button 
              type="button" 
              onClick={handleWithdraw} 
              className="w-full rounded-xl border border-border-light bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-lg transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
            >
              {t('invite:withdraw.action')}
            </button>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}
