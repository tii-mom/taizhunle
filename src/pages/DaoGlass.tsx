import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { RealtimeProfitBar } from '../components/glass/RealtimeProfitBar';
import { GlassModalGlass } from '@/components/glass/GlassModalGlass';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';
import { JurorStatusCard, type JurorStatus } from './dao/components/JurorStatusCard';
import { EarningsOverview } from './dao/components/EarningsOverview';
import { TaskList } from './dao/components/TaskList';
import { ActionPanel } from './dao/components/ActionPanel';
import { CreateLimitsCard } from './dao/components/CreateLimitsCard';
import { taskListMock } from './dao/mockData';
import {
  daoPoolQuery,
  daoProfileQuery,
  daoStatsQuery,
  type DaoProfileResponse,
  type DaoPoolStats,
  type DaoStatsResponse,
} from '@/queries/dao';
import { useHaptic } from '@/hooks/useHaptic';
import { triggerSuccessConfetti } from '@/utils/confetti';
import { useTheme } from '@/providers/ThemeProvider';

const LEVELS = [
  { key: 'normal', min: Number.NEGATIVE_INFINITY, max: -1, createHours: 360, juryPerDay: 0 },
  { key: 'l1', min: 0, max: 99, createHours: 72, juryPerDay: 3 },
  { key: 'l2', min: 100, max: 399, createHours: 48, juryPerDay: 9 },
  { key: 'l3', min: 400, max: 999, createHours: 24, juryPerDay: 30 },
  { key: 'l4', min: 1000, max: Number.POSITIVE_INFINITY, createHours: 6, juryPerDay: Infinity },
];

const DEFAULT_PROFILE: DaoProfileResponse = {
  userId: 'current_user',
  walletAddress: null,
  daoPoints: 0,
  isJuror: false,
  totalMarketsCreated: 0,
  totalCreationFeeTai: 0,
  winRate: 0,
  lastMarketCreatedAt: null,
  balance: { totalTai: 0, availableTai: 0, lockedTai: 0 },
};

const DEFAULT_POOL: DaoPoolStats = {
  create: { pending: 0, claimed: 0, total: 0 },
  jury: { pending: 0, claimed: 0, total: 0 },
  invite: { pending: 0, claimed: 0, total: 0 },
  platform: { pending: 0, claimed: 0, total: 0 },
  summary: { pending: 0, claimed: 0, total: 0, today: 0, last7Days: 0 },
};

const DEFAULT_STATS: DaoStatsResponse = {
  createCount: 0,
  juryCount: 0,
  inviteCount: 0,
  pendingAmount: 0,
  claimedAmount: 0,
  totalAmount: 0,
  lastEarningAt: null,
  lastClaimAt: null,
};

type StakeMode = 'stake' | 'unstake';

export default function DaoGlass() {
  const { t } = useI18n('dao');
  const { vibrate } = useHaptic();
  const queryClient = useQueryClient();
  const userId = 'current_user';

  const { data: profileData = DEFAULT_PROFILE } = useQuery(
    daoProfileQuery(userId),
  );
  const { data: statsData = DEFAULT_STATS } = useQuery(
    daoStatsQuery(userId),
  );
  const { data: poolStats = DEFAULT_POOL } = useQuery(daoPoolQuery());

  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [stakeMode, setStakeMode] = useState<StakeMode>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyTelegram, setVerifyTelegram] = useState('');
  const [verifyNote, setVerifyNote] = useState('');
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  const invalidateDashboard = () => {
    void queryClient.invalidateQueries({ queryKey: ['daoProfile', userId] });
    void queryClient.invalidateQueries({ queryKey: ['daoStats', userId] });
    void queryClient.invalidateQueries({ queryKey: ['daoClaim', userId] });
    void queryClient.invalidateQueries({ queryKey: ['daoPool'] });
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/dao/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to claim' }));
        throw new Error(payload.error ?? 'Failed to claim DAO rewards');
      }

      return (await response.json()) as { claimedAmount: number; txHash: string };
    },
    onSuccess: (data) => {
      vibrate(10);
      triggerSuccessConfetti();
      setFeedback({
        title: t('actions.claimSuccessTitle'),
        message: t('actions.claimSuccessMessage', {
          amount: data.claimedAmount.toLocaleString(),
          txHash: data.txHash,
        }),
      });
      invalidateDashboard();
    },
    onError: (error: Error) => {
      setFeedback({
        title: t('actions.claimFailedTitle'),
        message: error.message,
      });
    },
  });

  const stakeMutation = useMutation({
    mutationFn: async (payload: { amount: number; mode: StakeMode }) => {
      const endpoint = payload.mode === 'stake' ? '/api/dao/stake' : '/api/dao/unstake';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: payload.amount }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Stake request failed' }));
        throw new Error(data.error ?? 'Stake request failed');
      }

      return response.json() as Promise<{ balance: { availableTai: number; lockedTai: number } }>;
    },
    onSuccess: (data, variables) => {
      vibrate(15);
      const actionText = variables.mode === 'stake' ? t('actions.stakeSuccess') : t('actions.unstakeSuccess');
      setFeedback({
        title: actionText,
        message: t('actions.balanceUpdate', {
          available: data.balance.availableTai.toLocaleString(),
          locked: data.balance.lockedTai.toLocaleString(),
        }),
      });
      setStakeModalOpen(false);
      setStakeAmount('');
      invalidateDashboard();
    },
    onError: (error: Error) => {
      setFeedback({
        title: t('actions.stakeFailedTitle'),
        message: error.message,
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/dao/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, telegram: verifyTelegram, note: verifyNote }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(data.error ?? 'Verification failed');
      }

      return response.json() as Promise<{ profile: { daoPoints: number; isJuror: boolean } }>;
    },
    onSuccess: () => {
      vibrate(10);
      setFeedback({
        title: t('actions.verifySubmittedTitle'),
        message: t('actions.verifySubmittedMessage'),
      });
      setVerifyModalOpen(false);
      invalidateDashboard();
    },
    onError: (error: Error) => {
      setFeedback({
        title: t('actions.verifyFailedTitle'),
        message: error.message,
      });
    },
  });

  const level = useMemo(() => {
    const points = profileData.daoPoints ?? 0;
    return LEVELS.find((item) => points >= item.min && points <= item.max) ?? LEVELS[0];
  }, [profileData.daoPoints]);

  const nextLevelPoints = useMemo(() => {
    const levels = LEVELS;
    const currentIndex = levels.indexOf(level);
    const nextLevel = levels[currentIndex + 1];
    if (!nextLevel) {
      return profileData.daoPoints ?? 0;
    }
    return Math.max(nextLevel.min, (profileData.daoPoints ?? 0) + 1);
  }, [level, profileData.daoPoints]);

  const jurorStatus: JurorStatus = useMemo(() => {
    const points = profileData.daoPoints ?? 0;
    const lockedTai = profileData.balance.lockedTai ?? 0;
    const baseStake = lockedTai > 0 ? lockedTai : profileData.balance.totalTai ?? 0;
    const perCase = Math.max(1, Math.min(10, Math.round(baseStake / 10000)));
    const weight = ((points + 10) * Math.max(baseStake, 10000)) / 10000;

    const levelTitleKey = `createLimits.levels.${level.key}.title` as const;
    const levelTitle = t(levelTitleKey);
    const remainingLabel = level.juryPerDay === Infinity
      ? t('status.remainingUnlimited')
      : `${level.juryPerDay} ${t('status.times')}`;

    return {
      levelName: levelTitle,
      levelBadge: level.key.toUpperCase(),
      levelEmoji: '',
      points,
      nextLevelPoints,
      stakeAmount: baseStake,
      accuracy: Math.max(0, Math.min(100, (profileData.winRate ?? 0) * 100)),
      remainingLabel,
      weight,
      perCasePoints: perCase,
    } satisfies JurorStatus;
  }, [level, nextLevelPoints, profileData.balance.lockedTai, profileData.balance.totalTai, profileData.daoPoints, profileData.winRate, t]);

  const earningsOverview = useMemo(() => {
    return {
      totalPooled: poolStats.summary.total,
      pending: poolStats.summary.pending,
      today: poolStats.summary.today,
      last7Days: poolStats.summary.last7Days,
      reserve: poolStats.platform.total,
    };
  }, [poolStats]);

  const handleStakeOpen = (mode: StakeMode) => {
    setStakeMode(mode);
    setStakeAmount('');
    setStakeModalOpen(true);
  };

  const handleStakeSubmit = () => {
    const parsed = Number(stakeAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedback({ title: t('actions.invalidAmountTitle'), message: t('actions.invalidAmountMessage') });
      return;
    }
    stakeMutation.mutate({ amount: parsed, mode: stakeMode });
  };

  const handleVerifySubmit = () => {
    verifyMutation.mutate();
  };

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
      <JurorStatusCard
        status={jurorStatus}
        onStake={() => handleStakeOpen('stake')}
        onWithdraw={() => window.location.assign('/dao/withdraw')}
        onVerify={() => setVerifyModalOpen(true)}
        onShowRules={() => setRulesModalOpen(true)}
      />

        <EarningsOverview {...earningsOverview} />

        <RealtimeProfitBar
          total={earningsOverview.totalPooled}
          delta={{ value: poolStats.summary.today, intervalLabel: '24h' }}
          label={t('pool.total')}
        />

        <ActionPanel
          onStake={() => handleStakeOpen('stake')}
          onClaim={() => claimMutation.mutate()}
          onWithdraw={() => window.location.assign('/dao/withdraw')}
          claimDisabled={(statsData.pendingAmount ?? 0) <= 0}
          claimLoading={claimMutation.isPending}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-300/70">
            <h2 className="text-xl font-semibold text-white">{t('tasks.title')}</h2>
            <button
              type="button"
              onClick={() => window.location.assign('/dao/appeals')}
              className="text-xs uppercase tracking-[0.35em] text-cyan-200 hover:text-cyan-100"
            >
              {t('tasks.goAppeals')}
            </button>
          </div>
          <TaskList items={taskListMock} />
        </section>
      </div>

      <StakeModal
        open={stakeModalOpen}
        mode={stakeMode}
        amount={stakeAmount}
        onAmountChange={setStakeAmount}
        onModeChange={setStakeMode}
        onClose={() => setStakeModalOpen(false)}
        onSubmit={handleStakeSubmit}
        loading={stakeMutation.isPending}
        balance={profileData.balance}
      />

      <VerifyModal
        open={verifyModalOpen}
        telegram={verifyTelegram}
        note={verifyNote}
        onTelegramChange={setVerifyTelegram}
        onNoteChange={setVerifyNote}
        onClose={() => setVerifyModalOpen(false)}
        onSubmit={handleVerifySubmit}
        loading={verifyMutation.isPending}
        walletAddress={profileData.walletAddress}
        isJuror={profileData.isJuror}
      />

      <GlassModalGlass
        open={rulesModalOpen}
        title={t('createLimits.title')}
        onClose={() => setRulesModalOpen(false)}
      >
        <CreateLimitsCard stakeRange={[100, 10000]} showTitle={false} />
      </GlassModalGlass>

      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
    </GlassPageLayout>
  );
}

type StakeModalProps = {
  open: boolean;
  mode: StakeMode;
  amount: string;
  balance: DaoProfileResponse['balance'];
  loading: boolean;
  onModeChange: (mode: StakeMode) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

function StakeModal({ open, mode, amount, balance, loading, onModeChange, onAmountChange, onSubmit, onClose }: StakeModalProps) {
  const { t } = useI18n('dao');
  const { mode: themeMode } = useTheme();
  const isLight = themeMode === 'light';

  return (
    <GlassModalGlass
      open={open}
      title={t('modals.stake.title')}
      description={t('modals.stake.subtitle')}
      onClose={onClose}
      footer={(
        <div className="flex justify-end gap-3">
          <GlassButtonGlass variant="ghost" onClick={onClose}>
            {t('modals.common.cancel')}
          </GlassButtonGlass>
          <GlassButtonGlass
            onClick={onSubmit}
            className="!rounded-xl !bg-gradient-to-r !from-cyan-400 !to-emerald-400 !text-slate-900"
            disabled={loading}
          >
            {loading ? t('modals.common.processing') : t(mode === 'stake' ? 'modals.stake.confirm' : 'modals.unstake.confirm')}
          </GlassButtonGlass>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl border border-white/15 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => onModeChange('stake')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === 'stake'
                ? 'bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 text-white'
                : isLight ? 'text-slate-600' : 'text-white/60'
            }`}
          >
            {t('modals.stake.tabStake')}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('unstake')}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === 'unstake'
                ? 'bg-gradient-to-r from-rose-400/20 to-amber-400/20 text-white'
                : isLight ? 'text-slate-600' : 'text-white/60'
            }`}
          >
            {t('modals.unstake.tabUnstake')}
          </button>
        </div>

        <div className="space-y-2 text-sm text-white/80">
          <label className="flex flex-col gap-2">
            <span>{t('modals.stake.amount')}</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              className="glass-input"
              placeholder="1000"
            />
          </label>
          <p className="text-xs text-white/60">
            {t('modals.stake.hint', {
              available: balance.availableTai.toLocaleString(),
              locked: balance.lockedTai.toLocaleString(),
            })}
          </p>
        </div>
      </div>
    </GlassModalGlass>
  );
}

type VerifyModalProps = {
  open: boolean;
  telegram: string;
  note: string;
  walletAddress: string | null;
  loading: boolean;
  isJuror: boolean;
  onTelegramChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

function VerifyModal({ open, telegram, note, walletAddress, loading, isJuror, onTelegramChange, onNoteChange, onSubmit, onClose }: VerifyModalProps) {
  const { t } = useI18n('dao');

  return (
    <GlassModalGlass
      open={open}
      title={t('modals.verify.title')}
      description={t('modals.verify.subtitle')}
      onClose={onClose}
      footer={(
        <div className="flex justify-end gap-3">
          <GlassButtonGlass variant="ghost" onClick={onClose}>
            {t('modals.common.cancel')}
          </GlassButtonGlass>
          <GlassButtonGlass
            onClick={onSubmit}
            className="!rounded-xl !bg-gradient-to-r !from-amber-400 !to-rose-400 !text-slate-900"
            disabled={loading}
          >
            {loading ? t('modals.common.processing') : t('modals.verify.confirm')}
          </GlassButtonGlass>
        </div>
      )}
    >
      <div className="space-y-4 text-sm text-white/80">
        <p>{t('modals.verify.description')}</p>
        <div className="space-y-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Telegram</span>
            <input
              value={telegram}
              onChange={(event) => onTelegramChange(event.target.value)}
              className="glass-input"
              placeholder="@username"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Wallet</span>
            <input value={walletAddress ?? ''} readOnly className="glass-input opacity-60" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">{t('modals.verify.noteLabel')}</span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              className="glass-input min-h-[96px]"
              placeholder={t('modals.verify.notePlaceholder')}
            />
          </label>
        </div>
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-xs text-emerald-50">
          {isJuror ? t('modals.verify.alreadyJuror') : t('modals.verify.requirements')}
        </p>
      </div>
    </GlassModalGlass>
  );
}

type FeedbackModalProps = {
  feedback: { title: string; message: string } | null;
  onClose: () => void;
};

function FeedbackModal({ feedback, onClose }: FeedbackModalProps) {
  const { t } = useI18n('dao');
  if (!feedback) {
    return null;
  }

  return (
    <GlassModalGlass open title={feedback.title} description={feedback.message} onClose={onClose}>
      <div className="flex justify-end">
        <GlassButtonGlass
          className="!rounded-xl !bg-gradient-to-r !from-cyan-400 !to-emerald-400 !text-slate-900"
          onClick={onClose}
        >
          {t('modals.common.ok')}
        </GlassButtonGlass>
      </div>
    </GlassModalGlass>
  );
}
