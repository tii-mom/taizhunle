/**
 * DAO 控制台玻璃组件
 */
import { GlassCard } from './GlassCard';
import { CountUp } from './CountUp';
import { GoldenHammer } from './GoldenHammer';

type DaoConsoleGlassProps = {
  staked: number;
  contributions: number;
  points: number;
  nextLevelPoints: number;
  level: 'gray' | 'bronze' | 'silver' | 'gold';
  earnings: {
    jury: number;
    creator: number;
    invite: number;
  };
};

export function DaoConsoleGlass({ staked, contributions, points, nextLevelPoints, level, earnings }: DaoConsoleGlassProps) {
  const progress = Math.min((points / Math.max(nextLevelPoints, 1)) * 100, 100);

  return (
    <div className="space-y-5">
      <GlassCard className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-200/60">我的质押</p>
            <CountUp end={staked} className="font-mono text-3xl font-semibold text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]" />
            <p className="text-sm text-slate-200/70">TAI</p>
          </div>
          <GoldenHammer count={contributions} level={level} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-slate-200/70">
            <span>贡献次数</span>
            <span className="font-semibold text-amber-100">{contributions} 次</span>
          </div>
          <div className="glass-progress mt-3">
            <div className="glass-progress-value" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-slate-200/60">
            {points} / {nextLevelPoints} 点 · 下一等级
          </p>
        </div>
      </GlassCard>

      <GlassCard className="grid gap-4 p-5 sm:grid-cols-3">
        <DaoEarningPill label="陪审收益" value={earnings.jury} tone="emerald" />
        <DaoEarningPill label="创建收益" value={earnings.creator} tone="amber" />
        <DaoEarningPill label="邀请收益" value={earnings.invite} tone="violet" />
      </GlassCard>
    </div>
  );
}

type DaoEarningPillProps = {
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'violet';
};

function DaoEarningPill({ label, value, tone }: DaoEarningPillProps) {
  const toneMap = {
    emerald: {
      badge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
      arrow: 'text-emerald-200',
    },
    amber: {
      badge: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
      arrow: 'text-amber-200',
    },
    violet: {
      badge: 'bg-violet-400/15 text-violet-200 border-violet-300/30',
      arrow: 'text-violet-200',
    },
  } as const;

  const palette = toneMap[tone];

  return (
    <div className={`rounded-2xl border ${palette.badge} p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.25em]">{label}</span>
        <span className={`text-xs ${palette.arrow}`}>↑ 实时</span>
      </div>
      <CountUp end={value} className="mt-3 block font-mono text-2xl font-semibold text-white" />
      <p className="text-sm text-slate-200/70">TAI</p>
    </div>
  );
}
