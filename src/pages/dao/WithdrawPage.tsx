import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { CountUp } from '@/components/glass/CountUp';
import { useI18n } from '@/hooks/useI18n';

type StatusBadgeProps = { status: 'ok' | 'warning' };

type ChecklistItem = {
  labelKey: string;
  value: number;
  status: StatusBadgeProps['status'];
};

const CHECKLIST: ChecklistItem[] = [
  { labelKey: 'withdraw.checklist.stake', value: 125000, status: 'ok' },
  { labelKey: 'withdraw.checklist.points', value: 612, status: 'ok' },
  { labelKey: 'withdraw.checklist.pendingTasks', value: 0, status: 'ok' },
  { labelKey: 'withdraw.checklist.appeals', value: 1, status: 'warning' },
];

export default function WithdrawPage() {
  const { t } = useI18n('dao');

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <GlassCard className="space-y-3 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">{t('withdraw.title')}</p>
          <h1 className="text-2xl font-semibold drop-shadow-[0_0_20px_rgba(251,191,36,0.45)]">{t('withdraw.subtitle')}</h1>
          <p className="text-sm text-slate-200/70">{t('withdraw.description')}</p>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-white">{t('withdraw.checklistTitle')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {CHECKLIST.map((item) => (
              <div key={item.labelKey} className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-slate-200/80">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{t(item.labelKey)}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-lg text-white">
                    <CountUp end={item.value} />
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-white">{t('withdraw.timeline')}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {['instant', 'twentyFour', 'seventyTwo'].map((key) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/80">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{t(`withdraw.time.${key}`)}</p>
                <p className="mt-2 text-slate-100">{t(`withdraw.timeHint.${key}`)}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-white">{t('withdraw.stepsTitle')}</h2>
          <ol className="space-y-3 text-sm text-slate-200/80">
            {(t('withdraw.steps', { returnObjects: true }) as string[]).map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </GlassCard>

        <div className="flex flex-wrap items-center gap-3">
          <GlassButtonGlass className="!rounded-2xl !bg-gradient-to-r !from-emerald-400 !to-cyan-500 !text-slate-900">
            {t('withdraw.cta.confirm')}
          </GlassButtonGlass>
          <GlassButtonGlass variant="ghost" className="!rounded-2xl border border-white/15" onClick={() => window.history.back()}>
            {t('withdraw.cta.cancel')}
          </GlassButtonGlass>
        </div>
      </div>
    </GlassPageLayout>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] ${
        status === 'ok'
          ? 'border border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
          : 'border border-amber-300/40 bg-amber-400/10 text-amber-200'
      }`}
    >
      {status === 'ok' ? 'OK' : 'CHECK'}
    </span>
  );
}
