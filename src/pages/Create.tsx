import { useTranslation } from 'react-i18next';
import { CreateForm } from '../components/create/Form';
import { CreateSchedule } from '../components/create/Schedule';

export function Create() {
  const { t } = useTranslation('create');
  return (
    <main className="space-y-6">
      <header className="space-y-2 text-text-secondary">
        <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <CreateForm />
        <CreateSchedule />
      </section>
    </main>
  );
}
