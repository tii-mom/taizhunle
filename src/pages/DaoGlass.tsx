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
        <header className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-200/60">Dao 控制台</p>
          <h1 className="mt-2 text-2xl font-semibold text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
            {badge.name} · {badge.emoji}
          </h1>
          <p className="mt-3 text-sm text-slate-200/70">实时收益滚动与等级徽章，一键领取 DAO 分润</p>
        </header>

        <RealtimeProfitBar
          total={daoTotals.total}
          delta={{ value: poolDelta, intervalLabel: '24h' }}
          label="DAO 总池"
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
            <h2 className="text-lg font-semibold text-white">等级体系</h2>
            <p className="text-sm text-slate-200/70">陪审、创建、邀请均可累积点数，达成即自动升级。</p>
            <ul className="space-y-2 text-sm text-slate-200/60">
              <li>0 - 9 点：灰色锤（陪审候选）</li>
              <li>10 - 49 点：铜色锤（陪审正式）</li>
              <li>50 - 199 点：银色锤（高级陪审）</li>
              <li>200 点以上：金色锤（DAO 委员）</li>
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-200/60">
              <span>累计已领</span>
              <span>待释放</span>
            </div>
            <div className="grid gap-3 text-sm text-slate-200/80">
              <div className="flex items-center justify-between">
                <span>已经领取</span>
                <CountUp end={stats?.claimedAmount ?? 0} className="font-mono text-lg text-emerald-200" />
              </div>
              <div className="flex items-center justify-between">
                <span>待领取</span>
                <CountUp end={claimable} className="font-mono text-lg text-amber-200" />
              </div>
              <div className="flex items-center justify-between">
                <span>总收益</span>
                <CountUp end={totalEarnings} className="font-mono text-lg text-white" />
              </div>
            </div>
            <div className="glass-progress">
              <div className="glass-progress-value" style={{ width: `${Math.min(((stats?.claimedAmount ?? 0) / Math.max(totalEarnings, 1)) * 100, 100)}%` }} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-200/60">领取后 1 次 Gas，平台后付</p>
          </div>
        </GlassCard>
      </div>
    </GlassPageLayout>
  );
}
