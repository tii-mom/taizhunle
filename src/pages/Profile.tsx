import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileTitles } from '../components/profile/ProfileTitles';
import { ProfileBlindBox } from '../components/profile/ProfileBlindBox';
import { ProfileMilestones } from '../components/profile/ProfileMilestones';

export function Profile() {
  const { t } = useTranslation('profile');
  const achievements = useMemo(() => (t('achievements.items', { returnObjects: true }) as string[] | undefined) ?? [], [t]);
  return (
    <main className="space-y-6">
      <header className="space-y-2 text-text-secondary">
        <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <ProfileHeader
            name={t('user.name')}
            level={t('user.level')}
            exp={t('user.exp')}
            nextLevel={t('user.nextLevel')}
            streak={t('user.streak')}
          />
          <ProfileTitles
            heading={t('titles.heading')}
            highlight={t('titles.active')}
            titles={(t('titles.list', { returnObjects: true }) as string[]) ?? []}
          />
          <ProfileMilestones
            heading={t('milestones.heading')}
            labels={(t('milestones.labels', { returnObjects: true }) as string[]) ?? []}
            progress={Number(t('milestones.progress.current'))}
            target={Number(t('milestones.progress.target'))}
            emptyState={t('milestones.empty')}
            achievements={achievements}
          />
        </div>
        <ProfileBlindBox
          heading={t('blindbox.heading')}
          description={t('blindbox.description')}
          buttonLabel={t('blindbox.open')}
          notice={t('blindbox.notice')}
        />
      </section>
    </main>
  );
}
