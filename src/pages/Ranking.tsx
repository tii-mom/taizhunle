import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingLive } from '../components/ranking/RankingLive';
import { RankingShare } from '../components/ranking/RankingShare';
import { PageLayout } from '../components/layout/PageLayout';

export function Ranking() {
  const { t } = useTranslation('ranking');
  const liveEntries = useMemo(() => (t('live.entries', { returnObjects: true }) as string[]) ?? [], [t]);
  const sharePayload = t('share.template');
  return (
    <PageLayout>
      <div className="space-y-6 pb-32 lg:pb-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-text-secondary">{t('subtitle')}</p>
        </header>
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <RankingLive
            heading={t('live.heading')}
            updatedAt={t('live.updatedAt')}
            columns={(t('live.columns', { returnObjects: true }) as string[]) ?? []}
            entries={liveEntries}
            empty={t('live.empty')}
          />
          <RankingShare
            heading={t('share.heading')}
            description={t('share.description')}
            seoTitle={t('share.seoTitle')}
            seoDescription={t('share.seoDescription')}
            generateLabel={t('share.generate')}
            copyLabel={t('share.copy')}
            template={sharePayload}
          />
        </section>
      </div>
    </PageLayout>
  );
}
