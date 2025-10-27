import { useTranslation } from 'react-i18next';

export function CreateSchedule() {
  const { t } = useTranslation('create');
  const tips = (t('schedule.items', { returnObjects: true }) as string[] | undefined) ?? [];
  if (tips.length === 0) {
    return null;
  }
  return (
    <aside className="space-y-3 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <h2 className="text-xl font-semibold text-text-primary">{t('schedule.title')}</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </aside>
  );
}
