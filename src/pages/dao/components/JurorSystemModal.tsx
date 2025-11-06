import clsx from 'clsx';
import { X } from 'lucide-react';

import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { DAO_LEVELS, type DaoLevelKey } from '../constants';

const LEVEL_ORDER: DaoLevelKey[] = ['normal', 'l1', 'l2', 'l3', 'l4'];
const STAKE_KEYS: DaoLevelKey[] = ['l1', 'l2', 'l3', 'l4'];
const STAKE_RULES: Record<'l1' | 'l2' | 'l3' | 'l4', { stake: number; cooldownHours: number }> = {
  l1: { stake: 1_000, cooldownHours: 72 },
  l2: { stake: 5_000, cooldownHours: 48 },
  l3: { stake: 10_000, cooldownHours: 24 },
  l4: { stake: 20_000, cooldownHours: 6 },
};

type JurorSystemModalProps = {
  open: boolean;
  onClose: () => void;
  levelKey: DaoLevelKey;
  levelName: string;
  points: number;
  nextPoints: number;
  dailyLimit: number | null;
  dailyUsed: number;
};

export function JurorSystemModal({ open, onClose, levelKey, levelName, points, nextPoints, dailyLimit, dailyUsed }: JurorSystemModalProps) {
  const { t, locale } = useI18n('dao');
  const { mode } = useTheme();

  if (!open) {
    return null;
  }

  const formatter = new Intl.NumberFormat(locale);
  const highlightStakeKey: 'l1' | 'l2' | 'l3' | 'l4' = levelKey === 'normal' ? 'l1' : (levelKey as 'l1' | 'l2' | 'l3' | 'l4');
  const stakeRule = STAKE_RULES[highlightStakeKey];

  const sanitizedUsage = dailyLimit === null ? 0 : Math.min(dailyUsed, dailyLimit);
  const remainingCount = dailyLimit === null ? '∞' : String(Math.max(dailyLimit - sanitizedUsage, 0));
  const limitCount = dailyLimit === null ? '∞' : String(dailyLimit);
  const badgeIndex = Math.max(LEVEL_ORDER.indexOf(levelKey), 0);
  const badgeLabel = badgeIndex === 0 ? 'Lv.0' : `Lv.${badgeIndex}`;

  const stakeDisplay = `${formatter.format(stakeRule.stake)} TAI`;
  const penaltyAmount = formatter.format(Math.round(stakeRule.stake * 0.5));
  const cooldownLabel = t(`createLimits.levels.${highlightStakeKey}.create`);

  const penaltyList = (t('jurorSystem.penalty', { returnObjects: true }) as string[] | undefined) ?? [];
  const exampleList = (t('jurorSystem.example', {
    returnObjects: true,
    stake: stakeDisplay,
    cooldown: cooldownLabel,
    penalty: penaltyAmount,
  }) as string[] | undefined) ?? [];

  const cardClass = clsx(
    'w-full max-w-[440px] rounded-2xl border px-6 py-6 transition-all duration-200 ease-out',
    mode === 'light'
      ? 'border-slate-900/10 bg-white/95 text-slate-900 shadow-[0_18px_46px_-28px_rgba(15,23,42,0.35)]'
      : 'border-white/12 bg-[rgba(22,24,36,0.9)] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
  );

  const subTone = mode === 'light' ? 'text-slate-600' : 'text-white/70';
  const headerTone = mode === 'light' ? 'bg-white/80 text-slate-500' : 'bg-white/8 text-white/60';
  const rowTone = mode === 'light' ? 'bg-white/95 text-slate-900' : 'bg-white/6 text-white/85';
  const highlightTone = mode === 'light'
    ? 'border-l-4 border-cyan-400/80 bg-cyan-200/30 shadow-[0_12px_34px_-24px_rgba(14,165,233,0.45)]'
    : 'border-l-4 border-cyan-300/80 bg-cyan-400/12 shadow-[0_12px_34px_-24px_rgba(6,182,212,0.45)]';
  const listTone = mode === 'light' ? 'text-slate-700' : 'text-white/75';
  const exampleTone = mode === 'light'
    ? 'border border-emerald-400/30 bg-emerald-100/40 text-emerald-900'
    : 'border border-emerald-300/30 bg-emerald-400/10 text-emerald-50';

  const rightsRows = DAO_LEVELS.map((definition) => ({
    key: definition.key,
    cells: [
      t(`createLimits.levels.${definition.key}.points`),
      t(`createLimits.levels.${definition.key}.title`),
      t(`createLimits.levels.${definition.key}.jury`),
      t(`createLimits.levels.${definition.key}.create`),
    ],
  }));

  const stakeRows = STAKE_KEYS.map((key) => ({
    key,
    cells: [
      t(`createLimits.levels.${key}.title`),
      `${formatter.format(STAKE_RULES[key].stake)} TAI`,
      t(`createLimits.levels.${key}.create`),
    ],
  }));

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-5 py-8 backdrop-blur-xl">
      <div className={cardClass}>
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t('jurorSystem.title')}</h2>
            <p className={clsx('text-sm', subTone)}>
              {t('jurorSystem.yourLevel', { title: levelName, level: badgeLabel })}
            </p>
            <p className={clsx('text-sm', subTone)}>
              {t('jurorSystem.points', {
                points: formatter.format(points),
                next: formatter.format(nextPoints),
              })}
            </p>
            <p className={clsx('text-sm', subTone)}>
              {dailyLimit === null
                ? t('jurorSystem.remainingUnlimited')
                : t('jurorSystem.remaining', { remain: remainingCount, limit: limitCount })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'rounded-full p-2 transition',
              mode === 'light'
                ? 'border border-slate-900/15 text-slate-500 hover:border-slate-900/35 hover:text-slate-800'
                : 'border border-white/20 text-white/70 hover:border-white/40 hover:text-white',
            )}
            aria-label={t('common:close', { defaultValue: 'Close' })}
          >
            <X size={16} />
          </button>
        </header>

        <SectionTitle tone={subTone}>{t('jurorSystem.rightsTitle')}</SectionTitle>
        <Table
          headers={[t('jurorSystem.table.points'), t('jurorSystem.table.title'), t('jurorSystem.table.jury'), t('jurorSystem.table.create')]}
          columnTemplate="grid-cols-[130px_1fr_120px_120px]"
          rows={rightsRows}
          highlightKey={levelKey}
          headerClassName={headerTone}
          rowClassName={rowTone}
          highlightClassName={highlightTone}
        />

        <SectionTitle tone={subTone}>{t('jurorSystem.stakeRulesTitle')}</SectionTitle>
        <Table
          headers={[t('jurorSystem.stakeTable.level'), t('jurorSystem.stakeTable.stake'), t('jurorSystem.stakeTable.cooldown')]}
          columnTemplate="grid-cols-[1fr_140px_120px]"
          rows={stakeRows}
          highlightKey={highlightStakeKey}
          headerClassName={headerTone}
          rowClassName={rowTone}
          highlightClassName={highlightTone}
        />

        <SectionTitle tone={subTone}>{t('jurorSystem.penaltyTitle')}</SectionTitle>
        <ul className={clsx('mt-3 space-y-2 text-sm', listTone)}>
          {penaltyList.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="flex-1 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <SectionTitle tone={subTone}>{t('jurorSystem.exampleTitle')}</SectionTitle>
        <div className={clsx('mt-3 space-y-2 rounded-xl px-4 py-3 text-sm leading-relaxed', exampleTone)}>
          {exampleList.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <GlassButtonGlass
          className="mt-6 w-full !rounded-xl !bg-gradient-to-r !from-cyan-400 !to-emerald-400 !text-slate-900"
          onClick={onClose}
        >
          {t('jurorSystem.close')}
        </GlassButtonGlass>
      </div>
    </div>
  );
}

type TableProps = {
  headers: string[];
  columnTemplate: string;
  rows: { key: DaoLevelKey; cells: string[] }[];
  highlightKey: DaoLevelKey;
  headerClassName: string;
  rowClassName: string;
  highlightClassName: string;
};

function Table({ headers, columnTemplate, rows, highlightKey, headerClassName, rowClassName, highlightClassName }: TableProps) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
      <div className={clsx('grid px-4 py-2 text-[11px] uppercase tracking-[0.3em]', columnTemplate, headerClassName)}>
        {headers.map((header) => (
          <span key={header} className="truncate pr-3">
            {header}
          </span>
        ))}
      </div>
      <div className="divide-y divide-white/10">
        {rows.map((row) => {
          const isHighlight = row.key === highlightKey;
          return (
            <div
              key={row.key}
              className={clsx('grid items-center px-4 py-2 text-sm transition-colors', columnTemplate, rowClassName, isHighlight && highlightClassName)}
            >
              {row.cells.map((cell, index) => (
                <span key={`${row.key}-${index}`} className={clsx('truncate pr-3', index === 0 && 'font-mono font-semibold')}>
                  {cell}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SectionTitleProps = {
  children: string;
  tone: string;
};

function SectionTitle({ children, tone }: SectionTitleProps) {
  return <h3 className={clsx('mt-6 text-xs uppercase tracking-[0.35em]', tone)}>{children}</h3>;
}
