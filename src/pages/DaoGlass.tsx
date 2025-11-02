import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { RealtimeProfitBar } from '../components/glass/RealtimeProfitBar';
import { DaoConsoleGlass } from '../components/glass/DaoConsoleGlass';
import { DaoClaimGlass } from '../components/glass/DaoClaimGlass';
import { daoClaimQuery, daoPoolQuery, daoStatsQuery, type DaoPoolStats, type DaoStatsResponse } from '../queries/dao';
import { claimDao, getDaoBadge, getNextLevelPoints } from '../utils/dao';
import { GlassCard } from '../components/glass/GlassCard';
import { CountUp } from '../components/glass/CountUp';
import { GlassButtonGlass } from '../components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';

const DEMO_USER_ID = 'current_user';

const getLevelFromPoints = (points: number): 'gray' | 'bronze' | 'silver' | 'gold' => {
  if (points >= 200) return 'gold';
  if (points >= 50) return 'silver';
  if (points >= 10) return 'bronze';
  return 'gray';
};

const computePoints = (stats: DaoStatsResponse | undefined) => {
  if (!stats) return 0;
  return stats.juryCount * 12 + stats.createCount * 20 + stats.inviteCount * 8;
};

export function DaoGlass() {
  const queryClient = useQueryClient();

  const poolQuery = useQuery(daoPoolQuery());
  const statsQuery = useQuery(daoStatsQuery(DEMO_USER_ID));
  const claimQuery = useQuery(daoClaimQuery(DEMO_USER_ID));

  const daoTotals = useMemo(() => {
    const pool = poolQuery.data as DaoPoolStats | undefined;
    if (!pool) {
      return { total: 0, pending: 0 };
    }
    return Object.values(pool).reduce(
      (acc, entry) => ({
        total: acc.total + (entry.total ?? 0),
        pending: acc.pending + (entry.pending ?? 0),
      }),
      { total: 0, pending: 0 },
    );
  }, [poolQuery.data]);

  const stats = statsQuery.data;
  const points = computePoints(stats);
  const level = getLevelFromPoints(points);
  const nextLevelPoints = getNextLevelPoints(points);
  const badge = getDaoBadge(points);

  const contributions = (stats?.juryCount ?? 0) + (stats?.createCount ?? 0) + (stats?.inviteCount ?? 0);
  const staked = Math.max(1000, (stats?.juryCount ?? 0) * 320 + 1000);

  const totalEarnings = stats?.totalAmount ?? 0;
  const computeEarningShare = (value: number, fallbackRatio: number) => {
    if (!totalEarnings) return 0;
    if (!contributions) return totalEarnings * fallbackRatio;
    return totalEarnings * (value / contributions);
  };
  const earnings = {
    jury: computeEarningShare(stats?.juryCount ?? 0, 0.6),
    creator: computeEarningShare(stats?.createCount ?? 0, 0.25),
    invite: computeEarningShare(stats?.inviteCount ?? 0, 0.15),
  };

  const claimable = claimQuery.data?.pendingAmount ?? stats?.pendingAmount ?? 0;

  const poolDelta = useMemo(() => {
    if (daoTotals.total === 0) return 0;
    const ratio = (daoTotals.pending / daoTotals.total) * 100;
    return Math.min(Math.max(ratio, -12), 24);
  }, [daoTotals]);

  const { t } = useI18n('dao');
  const levelItems = t('levels.items', { returnObjects: true }) as string[];

  const handleClaim = async () => {
    try {
      await claimDao();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['daoClaim', DEMO_USER_ID] }),
        queryClient.invalidateQueries({ queryKey: ['daoStats', DEMO_USER_ID] }),
      ]);
    } catch (error) {
      console.error('Claim DAO failed', error);
    }
  };

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <header className="glass-card flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-200/60">
            <span>{t('header.title')}</span>
            <span>{t('header.tagline')}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
            {badge.name} · {badge.emoji}
          </h1>
          <p className="text-sm text-slate-200/70">
            {t('header.subtitle')}
          </p>
        </header>

        <RealtimeProfitBar
          total={daoTotals.total}
          delta={{ value: poolDelta, intervalLabel: '24h' }}
          label={t('pool.total')}
        />

        <DaoClaimGlass claimable={claimable} onClaim={handleClaim} />

        {statsQuery.isLoading || claimQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`dao-glass-skeleton-${index}`} className="glass-card h-40 animate-pulse rounded-3xl border-white/10 bg-white/5" />
            ))}
          </div>
        ) : (
          <DaoConsoleGlass
            staked={staked}
            contributions={contributions}
            points={points}
            nextLevelPoints={nextLevelPoints}
            level={level}
            earnings={earnings}
          />
        )}

        <GlassCard className="grid gap-6 p-5 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{t('levels.title')}</h2>
            <p className="text-sm text-slate-200/70">{t('levels.description')}</p>
            <ul className="space-y-2 text-sm text-slate-200/60">
              {levelItems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-200/60">
              <span>{t('levels.claimed')}</span>
              <span>{t('levels.pending')}</span>
            </div>
            <div className="grid gap-3 text-sm text-slate-200/80">
              <div className="flex items-center justify-between">
                <span>{t('levels.claimed')}</span>
                <CountUp end={stats?.claimedAmount ?? 0} className="font-mono text-lg text-emerald-200" />
              </div>
              <div className="flex items-center justify-between">
                <span>{t('levels.pending')}</span>
                <CountUp end={claimable} className="font-mono text-lg text-amber-200" />
              </div>
              <div className="flex items-center justify-between">
                <span>{t('levels.total')}</span>
                <CountUp end={totalEarnings} className="font-mono text-lg text-white" />
              </div>
            </div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${Math.min(((stats?.claimedAmount ?? 0) / Math.max(totalEarnings, 1)) * 100, 100)}%` }} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-200/60">{t('console.progressLabel')}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5 text-sm text-slate-200/70">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-200/60">{t('jury.title')}</p>
            <p>{t('jury.description')}</p>
            <p>{t('jury.note')}</p>
          </div>
          <GlassButtonGlass
            className="w-full !rounded-2xl"
            onClick={() => window.alert(t('jury.comingSoon'))}
          >
            {t('jury.cta')}
          </GlassButtonGlass>
        </GlassCard>
      </div>
    </GlassPageLayout>
  );
}
