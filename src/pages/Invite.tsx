import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InviteSummary } from '../components/invite/InviteSummary';
import { InviteRewards } from '../components/invite/InviteRewards';
import { InviteHistory } from '../components/invite/InviteHistory';
import { PageLayout } from '../components/layout/PageLayout';

type HistoryEntry = {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
};

export function Invite() {
  const { t } = useTranslation(['invite', 'history']);
  const tiers = useMemo(() => (t('invite:rewards.tiers', { returnObjects: true }) as string[]) ?? [], [t]);
  const logs = useMemo(
    () => (t('history:records', { returnObjects: true }) as HistoryEntry[] | undefined) ?? [],
    [t],
  );
  return (
    <PageLayout>
      <div className="space-y-6">
      <header className="space-y-2 text-text-secondary">
        <h1 className="text-3xl font-semibold text-text-primary">{t('invite:title')}</h1>
        <p>{t('invite:subtitle')}</p>
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
        <aside className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
          <h2 className="text-xl font-semibold text-text-primary">{t('invite:withdraw.heading')}</h2>
          <p className="text-sm text-text-secondary">{t('invite:withdraw.description')}</p>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
            <p className="text-2xl font-semibold text-text-primary">{t('invite:withdraw.balance')}</p>
            <p>{t('invite:withdraw.note')}</p>
          </div>
          <button type="button" onClick={() => window.alert(t('invite:toasts.withdraw'))} className="w-full rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-transform active:scale-95">
            {t('invite:withdraw.action')}
          </button>
        </aside>
      </section>
      </div>
    </PageLayout>
  );
}
