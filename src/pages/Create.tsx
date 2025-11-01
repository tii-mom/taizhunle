import { useTranslation } from 'react-i18next';

import { CreateForm } from '../components/create/Form';
import { CreateSchedule } from '../components/create/Schedule';
import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { GlassCard } from '../components/glass/GlassCard';

export function Create() {
  const { t } = useTranslation('create');
  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <GlassCard className="space-y-2 p-6">
          <h1 className="text-3xl font-semibold text-white drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]">{t('title')}</h1>
          <p className="text-sm text-white/70">{t('subtitle')}</p>
        </GlassCard>
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <CreateForm />
          <CreateSchedule />
        </section>
      </div>
    </GlassPageLayout>
  );
}
