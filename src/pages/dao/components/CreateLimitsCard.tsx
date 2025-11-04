import clsx from 'clsx';

import { GlassCard } from '@/components/glass/GlassCard';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

const LEVEL_KEYS = ['normal', 'l1', 'l2', 'l3', 'l4'] as const;

type CreateLimitsCardProps = {
  showTitle?: boolean;
  className?: string;
};

export function CreateLimitsCard({ showTitle = true, className }: CreateLimitsCardProps) {
  const { t } = useI18n('dao');
  const { mode } = useTheme();
  const isLight = mode === 'light';

  const headerText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-600' : 'text-white/70';
  const tableHeaderTone = isLight
    ? 'bg-white/90 text-slate-500 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]'
    : 'bg-white/10 text-white/60';
  const rowTone = isLight
    ? 'bg-white/95 text-slate-900 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.45)]'
    : 'bg-white/6 text-white/85';
  const primaryText = isLight ? 'text-slate-900' : 'text-white';
  const secondaryText = isLight ? 'text-slate-600' : 'text-white/70';

  const description = t('createLimits.description');

  return (
    <GlassCard className={clsx('space-y-6 p-6', className)}>
      {showTitle ? (
        <header className="space-y-2">
          <h2 className={clsx('text-lg font-semibold', headerText)}>{t('createLimits.title')}</h2>
          {description ? (
            <p className={clsx('text-sm leading-relaxed', subText)}>{description}</p>
          ) : null}
        </header>
      ) : null}

      <section className="space-y-3">
        <div
          className={clsx(
            'grid grid-cols-[130px_1fr_140px_140px] items-center gap-2 rounded-2xl px-4 py-3 text-[11px] uppercase tracking-[0.3em]',
            tableHeaderTone,
          )}
        >
          <span>{t('createLimits.table.points')}</span>
          <span>{t('createLimits.table.title')}</span>
          <span className="text-right">{t('createLimits.table.create')}</span>
          <span className="text-right">{t('createLimits.table.jury')}</span>
        </div>

        <div className="space-y-2">
          {LEVEL_KEYS.map((key) => (
            <div
              key={key}
              className={clsx(
                'grid grid-cols-[130px_1fr_140px_140px] items-center gap-2 rounded-2xl px-4 py-3 text-sm transition-shadow duration-200',
                rowTone,
              )}
            >
              <span className={clsx('font-mono text-base font-semibold', primaryText)}>{t(`createLimits.levels.${key}.points`)}</span>
              <span className={clsx('text-sm', primaryText)}>{t(`createLimits.levels.${key}.title`)}</span>
              <span className="text-right text-sm">{t(`createLimits.levels.${key}.create`)}</span>
              <span className="text-right text-sm">{t(`createLimits.levels.${key}.jury`)}</span>
            </div>
          ))}
        </div>
      </section>

      <p className={clsx('text-xs leading-relaxed', secondaryText)}>{t('createLimits.note')}</p>
    </GlassCard>
  );
}
