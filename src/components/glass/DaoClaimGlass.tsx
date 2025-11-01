/**
 * DAO 领取按钮玻璃组件
 */
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { CountUp } from './CountUp';
import { GlassCard } from './GlassCard';

type DaoClaimGlassProps = {
  claimable: number;
  onClaim: () => Promise<void>;
};

export function DaoClaimGlass({ claimable, onClaim }: DaoClaimGlassProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    if (claimable <= 0 || isClaiming || claimed) return;

    setIsClaiming(true);
    try {
      await onClaim();
      setClaimed(true);
      
      // 成功动效
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#D97706', '#B45309'],
      });
    } catch (error) {
      console.error('领取失败:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-200/60">可领取收益</p>
          <CountUp end={claimable} className="font-mono text-3xl font-semibold text-amber-200" />
          <p className="text-sm text-slate-200/70">TAI</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs uppercase tracking-[0.35em] text-amber-100/80">
          gas x1
          <br />
          平台代付
        </div>
      </div>
      <button
        type="button"
        onClick={handleClaim}
        disabled={claimable <= 0 || isClaiming || claimed}
        className="glass-button-primary w-full text-center disabled:cursor-not-allowed"
      >
        {claimed ? '已领取' : isClaiming ? '领取中...' : '一键领取'}
      </button>
    </GlassCard>
  );
}
