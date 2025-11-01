/**
 * DAO Pool Card - 插入式组件
 * 显示 DAO 收益池和领取按钮
 * 插入位置：AssetsPage 底部
 */

import { useEffect, useState } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { triggerSuccessConfetti } from '../../utils/confetti';

export function DaoPoolCard() {
  const [totalPool, setTotalPool] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [claiming, setClaiming] = useState(false);
  
  const animatedTotal = useCountUp(totalPool, 1000);
  const animatedPending = useCountUp(pendingAmount, 1000);

  useEffect(() => {
    // 模拟获取 DAO 池数据
    const fetchDaoPool = async () => {
      try {
        // TODO: 替换为真实 API 调用
        setTotalPool(Math.floor(Math.random() * 1000000));
        setPendingAmount(Math.floor(Math.random() * 10000));
      } catch (error) {
        console.error('Failed to fetch DAO pool:', error);
      }
    };

    fetchDaoPool();
    // 每30秒刷新一次
    const interval = setInterval(fetchDaoPool, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async () => {
    if (pendingAmount === 0 || claiming) return;
    
    setClaiming(true);
    try {
      // TODO: 调用真实的领取函数
      await new Promise(resolve => setTimeout(resolve, 2000));
      triggerSuccessConfetti();
      window.alert(`成功领取 ${pendingAmount.toLocaleString()} TAI 🎉`);
      setPendingAmount(0);
    } catch (error) {
      console.error('Claim failed:', error);
      window.alert('领取失败，请稍后重试');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-amber-400/20 bg-gray-900/50 p-4 shadow-2xl backdrop-blur-md">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins size={20} className="text-amber-400" />
          <span className="font-semibold text-text-primary">DAO 收益池</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-xs text-amber-400">实时</span>
        </div>
      </div>

      {/* 总池 */}
      <div className="rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
        <div className="text-xs text-text-secondary">总池</div>
        <div className="mt-1 font-mono text-xl font-bold text-amber-400">
          {Math.floor(animatedTotal).toLocaleString()} TAI
        </div>
      </div>

      {/* 可领取 */}
      <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 backdrop-blur-md">
        <div>
          <div className="text-xs text-text-secondary">可领取</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-amber-400">
              {Math.floor(animatedPending).toLocaleString()}
            </span>
            <span className="text-sm text-amber-400/70">TAI</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming || pendingAmount === 0}
          className="rounded-xl border border-transparent bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:shadow-amber-400/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {claiming ? '...' : pendingAmount === 0 ? '已领取' : '领取'}
        </button>
      </div>

      {/* 提示 */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <TrendingUp size={12} className="text-amber-400" />
        <span>集中领取，仅需支付一次 Gas 费</span>
      </div>
    </div>
  );
}
