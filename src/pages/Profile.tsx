import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileMilestones } from '../components/profile/ProfileMilestones';
import { PageLayout } from '../components/layout/PageLayout';

export function Profile() {
  const { t } = useTranslation('profile');
  const achievements = useMemo(
    () => (t('achievements.items', { returnObjects: true }) as string[] | undefined) ?? [],
    [t],
  );

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="space-y-2 text-text-secondary">
          <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        <section className="space-y-6">
          <ProfileHeader
            name={t('user.name')}
            level={t('user.level')}
            exp={t('user.exp')}
            nextLevel={t('user.nextLevel')}
            streak={t('user.streak')}
          />
          <ProfileMilestones
            heading={t('milestones.heading')}
            labels={(t('milestones.labels', { returnObjects: true }) as string[]) ?? []}
            progress={Number(t('milestones.progress.current'))}
            target={Number(t('milestones.progress.target'))}
            emptyState={t('milestones.empty')}
            achievements={achievements}
          />
        </section>
      </div>
    </PageLayout>
  );
}
