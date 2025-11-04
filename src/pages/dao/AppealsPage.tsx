import { useState, type ReactNode } from 'react';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';

const MOCK_APPEALS = [
  {
    id: 'appeal-1',
    title: 'BTC 是否在 12 月前突破 150K',
    target: '单陪审员 EQB6...9F8K',
    amount: 3200,
    status: 'pending',
    time: '2025-11-15 13:20',
  },
  {
    id: 'appeal-2',
    title: 'TON NFT 空投按时发放？',
    target: '全体陪审员',
    amount: 10000,
    status: 'approved',
    time: '2025-11-12 19:02',
  },
];

export default function AppealsPage() {
  const { t } = useI18n('dao');
  const [activeTab, setActiveTab] = useState<'create' | 'records'>('create');

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
            {t('appeals.createTab')}
          </TabButton>
          <TabButton active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
            {t('appeals.recordsTab')}
          </TabButton>
        </div>

        {activeTab === 'create' ? <CreateAppeal /> : <AppealRecords />}
      </div>
    </GlassPageLayout>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] transition-all ${
        active
          ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100'
          : 'border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function CreateAppeal() {
  const { t } = useI18n('dao');
  const [reason, setReason] = useState('');

  return (
    <GlassCard className="space-y-5 p-6">
      <div className="space-y-2 text-sm text-slate-200/80">
        <h1 className="text-xl font-semibold text-white">{t('appeals.createTitle')}</h1>
        <p className="rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-amber-200">
          {t('appeals.depositHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t('appeals.selectPrediction')}>
          <input
            type="text"
            placeholder={t('appeals.searchPlaceholder')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
          />
        </Field>
        <Field label={t('appeals.target')}>
          <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none">
            <option value="single">{t('appeals.targetSingle')}</option>
            <option value="all">{t('appeals.targetAll')}</option>
          </select>
        </Field>
      </div>

      <Field label={t('appeals.reason')}>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('appeals.reasonPlaceholder')}
          className="min-h-[160px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
        />
      </Field>

      <Field label={t('appeals.evidence')}>
        <div className="grid gap-3 sm:grid-cols-3">
          {['image', 'video', 'link'].map((type) => (
            <button
              key={type}
              type="button"
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:border-cyan-300/40 hover:text-white"
            >
              {t(`appeals.evidence.${type}` as const)}
            </button>
          ))}
        </div>
      </Field>

      <GlassButtonGlass
        className="w-full !rounded-2xl !bg-gradient-to-r !from-rose-400 !via-amber-400 !to-yellow-300 !text-slate-900"
        onClick={() => window.alert('申诉提交占位')}
      >
        {t('appeals.submit')}
      </GlassButtonGlass>
    </GlassCard>
  );
}

function AppealRecords() {
  const { t } = useI18n('dao');
  return (
    <div className="space-y-4">
      {MOCK_APPEALS.map((appeal) => (
        <GlassCard key={appeal.id} className="space-y-3 p-5 text-sm text-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.35em]">
            <span className="text-slate-300/60">{appeal.time}</span>
            <span
              className={`rounded-full px-3 py-1 ${
                appeal.status === 'pending'
                  ? 'border border-amber-300/40 bg-amber-400/10 text-amber-200'
                  : appeal.status === 'approved'
                    ? 'border border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
                    : 'border border-rose-300/40 bg-rose-400/10 text-rose-200'
              }`}
            >
              {t(`appeals.status.${appeal.status}` as const)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{appeal.title}</h3>
          <p className="text-xs text-slate-300/60">{t('appeals.targetLabel')} · {appeal.target}</p>
          <p className="text-sm text-emerald-200">{t('appeals.amount', { amount: appeal.amount.toLocaleString() })}</p>
          <GlassButtonGlass variant="ghost" className="!rounded-xl">
            {t('appeals.viewDetail')}
          </GlassButtonGlass>
        </GlassCard>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-slate-200/80">
      <span className="text-xs uppercase tracking-[0.35em] text-slate-300/60">{label}</span>
      {children}
    </label>
  );
}
