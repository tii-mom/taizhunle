import { useTranslation } from 'react-i18next';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export function CreateSchedule() {
  const { t } = useTranslation('create');
  const tips = (t('schedule.items', { returnObjects: true }) as string[] | undefined) ?? [];
  if (tips.length === 0) {
    return null;
  }
  return (
    <aside className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <Lightbulb size={20} className="text-accent" />
        <h2 className="text-xl font-semibold text-text-primary">{t('schedule.title')}</h2>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li 
            key={index} 
            className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-accent" />
            <span className="text-sm text-text-secondary">{tip}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
