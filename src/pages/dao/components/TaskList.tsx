import clsx from 'clsx';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { TaskItem } from '../mockData';
import { CountDown } from '@/components/glass/CountDown';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';

const TYPE_LABEL: Record<TaskItem['type'], { zh: string; en: string; tone: string }> = {
  dispute: { zh: '争议', en: 'Dispute', tone: 'border-amber-300/50 bg-amber-400/10 text-amber-200' },
  report: { zh: '举报', en: 'Report', tone: 'border-rose-300/50 bg-rose-400/10 text-rose-200' },
  timeout: { zh: '超时', en: 'Timeout', tone: 'border-cyan-300/50 bg-cyan-400/10 text-cyan-200' },
};

export type TaskListProps = {
  items: TaskItem[];
};

export function TaskList({ items }: TaskListProps) {
  const { t } = useI18n('dao');
  const navigate = useNavigate();

  const sorted = useMemo(() => [...items].sort((a, b) => a.endsAt - b.endsAt), [items]);

  if (sorted.length === 0) {
    return (
      <div className="glass-card flex h-32 items-center justify-center text-sm text-slate-300/70">
        {t('tasks.empty')}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sorted.map((task) => (
        <article
          key={task.id}
          className="glass-card group grid gap-4 border-white/10 p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_24px_44px_-36px_rgba(34,211,238,0.45)]"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className={clsx('rounded-full border px-3 py-1 text-xs uppercase tracking-[0.35em]', TYPE_LABEL[task.type].tone)}>
              {TYPE_LABEL[task.type].zh} · {TYPE_LABEL[task.type].en}
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
              {task.status === 'pending' ? t('tasks.pending') : task.status === 'review' ? t('tasks.review') : t('tasks.closed')}
            </span>
          </header>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_18px_rgba(0,212,255,0.35)]">
              {task.title}
            </h3>
            <div className="grid gap-3 text-sm text-slate-200/80 md:grid-cols-4">
              <ValuePair label={t('tasks.pool')} value={`${task.pool.toLocaleString()} TAI`} />
              <ValuePair label={t('tasks.jurors')} value={`${task.jurorCount} ${t('tasks.people')}`} />
              <ValuePair label={t('tasks.reward')} value={`${task.reward.toLocaleString()} TAI`} accent="emerald" />
              <ValuePair label={t('tasks.points')} value={`+${task.pointsGain}`} accent="amber" />
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-200/80">
              <span>{t('tasks.remaining')}</span>
              <CountDown endTime={task.endsAt} />
            </div>
            <div className="flex items-center gap-2">
              <GlassButtonGlass
                variant="ghost"
                className="!rounded-xl"
                onClick={() => navigate(`/dao/task/${task.id}`)}
              >
                {t('tasks.actions.view')}
              </GlassButtonGlass>
              <GlassButtonGlass
                className="!rounded-xl !bg-gradient-to-r !from-emerald-400 !to-teal-500 !text-slate-900"
                onClick={() => navigate(`/dao/task/${task.id}?action=vote`)}
              >
                {t('tasks.actions.vote')}
              </GlassButtonGlass>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}

type ValuePairProps = {
  label: string;
  value: string;
  accent?: 'emerald' | 'amber';
};

function ValuePair({ label, value, accent }: ValuePairProps) {
  const accentTone =
    accent === 'emerald'
      ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]'
      : accent === 'amber'
        ? 'text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]'
        : 'text-white';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{label}</span>
      <span className={clsx('font-mono text-base font-semibold', accentTone)}>{value}</span>
    </div>
  );
}
