import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { CountDown } from '@/components/glass/CountDown';
import { useI18n } from '@/hooks/useI18n';
import { taskListMock } from './mockData';

const MOCK_JURORS = [
  { wallet: 'EQB6...9F8K', telegram: '@juror_one', vote: 'A', points: 124, accuracy: 93 },
  { wallet: 'EQC2...5LK1', telegram: '@juror_two', vote: 'B', points: 310, accuracy: 88 },
  { wallet: 'EQF9...TT31', telegram: '@juror_three', vote: 'A', points: 452, accuracy: 96 },
  { wallet: 'EQAB...ZZ03', telegram: '@juror_four', vote: 'A', points: 201, accuracy: 91 },
];

export default function TaskDetailPage() {
  const { id = '' } = useParams();
  const { t } = useI18n('dao');
  const navigate = useNavigate();
  const [vote, setVote] = useState<'A' | 'B' | 'Invalid' | null>(null);
  const [reason, setReason] = useState('');

  const task = useMemo(() => taskListMock.find((item) => item.id === id), [id]);

  if (!task) {
    return (
      <GlassPageLayout>
        <div className="glass-card p-6 text-center text-sm text-slate-200/70">
          {t('taskDetail.notFound')}
        </div>
      </GlassPageLayout>
    );
  }

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-12">
        <GlassCard className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-slate-300/60">
            <span>{t('taskDetail.breadcrumb')}</span>
            <span className="text-cyan-200/80">ID · {task.id}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white drop-shadow-[0_0_22px_rgba(0,212,255,0.45)]">{task.title}</h1>
          <div className="grid gap-3 text-sm text-slate-200/80 md:grid-cols-4">
            <Metric label={t('tasks.pool')} value={`${task.pool.toLocaleString()} TAI`} />
            <Metric label={t('tasks.jurors')} value={`${task.jurorCount} ${t('tasks.people')}`} />
            <Metric label={t('tasks.reward')} value={`${task.reward.toLocaleString()} TAI`} accent />
            <Metric label={t('tasks.remaining')} value={<CountDown endTime={task.endsAt} />} />
          </div>
        </GlassCard>

        <GlassCard className="grid gap-4 p-6 lg:grid-cols-3">
          <VotingPanel vote={vote} onVote={setVote} reason={reason} onReasonChange={setReason} onSubmit={() => window.alert('投票已提交')} />
          <div className="lg:col-span-2 space-y-4">
            <JurorList />
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-6 text-sm text-slate-200/80">
          <h2 className="text-lg font-semibold text-white">{t('taskDetail.overview')}</h2>
          <p>{t('taskDetail.placeholder')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <GlassButtonGlass variant="ghost" className="!rounded-xl" onClick={() => navigate('/dao')}>
              {t('taskDetail.back')}
            </GlassButtonGlass>
            <GlassButtonGlass className="!rounded-xl !bg-gradient-to-r !from-rose-400 !to-amber-400 !text-slate-900" onClick={() => navigate('/dao/appeals')}>
              {t('taskDetail.raiseAppeal')}
            </GlassButtonGlass>
          </div>
        </GlassCard>
      </div>
    </GlassPageLayout>
  );
}

type MetricProps = {
  label: string;
  value: string | ReactNode;
  accent?: boolean;
};

function Metric({ label, value, accent }: MetricProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{label}</p>
      <p className={`mt-2 font-mono text-lg ${accent ? 'text-emerald-200' : 'text-white'}`}>{value}</p>
    </div>
  );
}

type VotingPanelProps = {
  vote: 'A' | 'B' | 'Invalid' | null;
  onVote: (value: 'A' | 'B' | 'Invalid') => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
};

function VotingPanel({ vote, onVote, reason, onReasonChange, onSubmit }: VotingPanelProps) {
  const { t } = useI18n('dao');
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">{t('taskDetail.myVote')}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['A', 'B', 'Invalid'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onVote(option)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                vote === option
                  ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100 shadow-[0_18px_38px_-32px_rgba(16,185,129,0.55)]'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:border-emerald-300/50 hover:text-white'
              }`}
            >
              {option === 'Invalid' ? t('taskDetail.invalid') : t(`taskDetail.option${option}` as const)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{t('taskDetail.reason')}</label>
        <textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder={t('taskDetail.reasonPlaceholder')}
          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
        />
      </div>
      <GlassButtonGlass
        className="w-full !rounded-2xl !bg-gradient-to-r !from-cyan-400 !via-emerald-400 !to-blue-500 !text-slate-900"
        onClick={onSubmit}
        disabled={!vote}
      >
        {vote ? t('taskDetail.submitWithVote', { vote }) : t('taskDetail.submitDisabled')}
      </GlassButtonGlass>
    </div>
  );
}

function JurorList() {
  const { t } = useI18n('dao');
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-300/70">
        <h2 className="text-lg font-semibold text-white">{t('taskDetail.jurors')}</h2>
        <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">{t('taskDetail.onchainSynced')}</span>
      </div>
      <div className="grid gap-3">
        {MOCK_JURORS.map((juror) => (
          <div key={juror.wallet} className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-white">{juror.wallet}</p>
                <p className="text-xs text-slate-300/60">{juror.telegram}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="uppercase tracking-[0.35em] text-emerald-200">{t('taskDetail.voteChoice')} · {juror.vote}</span>
                <span className="text-slate-300/60">{t('taskDetail.points')} +{juror.points}</span>
                <span className="text-slate-300/60">{t('taskDetail.accuracy')} {juror.accuracy}%</span>
                <button type="button" className="text-cyan-200 underline" onClick={() => navigator.clipboard.writeText(juror.wallet)}>
                  {t('taskDetail.copy')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
