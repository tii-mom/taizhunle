/**
 * DAO Pool Card Component
 * DAO 收益池卡片 - 显示用户的 DAO 收益和领取按钮
 */

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Users, Award } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';
import { triggerSuccessConfetti } from '../../utils/confetti';

interface DaoStats {
  createCount: number;
  juryCount: number;
  inviteCount: number;
  pendingAmount: number;
  claimedAmount: number;
  totalAmount: number;
}

interface Props {
  userId?: string;
  onClaim?: (amount: number) => Promise<void>;
}

export function DaoPoolCard({ userId, onClaim }: Props) {
  const { vibrate } = useHaptic();
  const [stats, setStats] = useState<DaoStats | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/dao/stats/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch DAO stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // 每 30 秒刷新一次
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleClaim = async () => {
    if (!stats || stats.pendingAmount === 0 || claiming) return;

    vibrate(10);
    setClaiming(true);

    try {
      if (onClaim) {
        await onClaim(stats.pendingAmount);
      } else {
        // 默认调用 API
        const response = await fetch('/api/dao/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Claim failed');
        }
      }

      triggerSuccessConfetti();
      window.alert(`成功领取 ${stats.pendingAmount.toLocaleString()} TAI 🎉`);

      // 刷新数据
      const response = await fetch(`/api/dao/stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Claim error:', error);
      window.alert('领取失败，请稍后重试');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
        <div className="h-8 w-32 rounded bg-surface-glass/60" />
        <div className="h-16 w-full rounded bg-surface-glass/60" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-border-light bg-surface-glass/60 p-6 text-center shadow-2xl backdrop-blur-md">
        <p className="text-text-secondary">暂无 DAO 收益数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 via-surface-glass/60 to-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins size={24} className="text-[#F59E0B]" />
          <h2 className="text-xl font-semibold text-text-primary">DAO 收益池</h2>
        </div>
        <div className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-1">
          <span className="text-xs font-medium text-[#F59E0B]">实时</span>
        </div>
      </div>

      {/* 可领取金额 */}
      <div className="rounded-xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 p-4 backdrop-blur-md">
        <p className="text-sm text-text-secondary">可领取</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold text-[#F59E0B]">
            {stats.pendingAmount.toLocaleString()}
          </span>
          <span className="text-xl font-semibold text-[#F59E0B]/70">TAI</span>
        </div>
      </div>

      {/* 贡献统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <TrendingUp size={12} />
            <span>创建</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-[#10B981]">{stats.createCount}</p>
        </div>

        <div className="rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Award size={12} />
            <span>陪审</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-[#F59E0B]">{stats.juryCount}</p>
        </div>

        <div className="rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Users size={12} />
            <span>邀请</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold text-[#8B5CF6]">{stats.inviteCount}</p>
        </div>
      </div>

      {/* 累计收益 */}
      <div className="flex items-center justify-between rounded-lg bg-surface-glass/60 p-3 text-sm">
        <span className="text-text-secondary">累计收益</span>
        <span className="font-mono font-semibold text-text-primary">
          {stats.totalAmount.toLocaleString()} TAI
        </span>
      </div>

      {/* 领取按钮 */}
      <button
        type="button"
        onClick={handleClaim}
        disabled={claiming || stats.pendingAmount === 0}
        className="w-full rounded-xl border border-transparent bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:ring-2 hover:ring-[#F59E0B]/50 hover:shadow-[#F59E0B]/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {claiming ? '领取中...' : stats.pendingAmount === 0 ? '暂无可领取' : '一键领取'}
      </button>

      {/* 提示 */}
      <div className="rounded-lg bg-accent/10 p-3 text-xs text-text-secondary">
        <p>💡 集中领取，仅需支付一次 Gas 费</p>
      </div>
    </div>
  );
}
