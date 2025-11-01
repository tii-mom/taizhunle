import { useTranslation } from 'react-i18next';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

import { GlassCard } from '../glass/GlassCard';

export function CreateSchedule() {
  const { t } = useTranslation('create');
  const tips = (t('schedule.items', { returnObjects: true }) as string[] | undefined) ?? [];
  if (tips.length === 0) {
    return null;
  }
  return (
    <GlassCard className="space-y-4 p-6">
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <Lightbulb size={20} className="text-amber-200" />
        <h2 className="text-xl font-semibold text-white">{t('schedule.title')}</h2>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li
            key={tip}
            className="glass-card-sm animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 p-4 text-sm text-white/70"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-amber-200" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
