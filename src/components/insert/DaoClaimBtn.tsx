/**
 * DAO Claim Button - 插入式组件
 * 显示 DAO 领取按钮
 * 插入位置：RankingPage 邀请收益右侧
 */

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { triggerSuccessConfetti } from '../../utils/confetti';

export function DaoClaimBtn() {
  const [pendingAmount, setPendingAmount] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    // 模拟获取待领取金额
    const fetchPending = async () => {
      try {
        // TODO: 替换为真实 API 调用
        setPendingAmount(Math.floor(Math.random() * 10000));
      } catch (error) {
        console.error('Failed to fetch pending amount:', error);
      }
    };

    fetchPending();
    // 每30秒刷新一次
    const interval = setInterval(fetchPending, 30000);
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

  if (pendingAmount === 0) return null;

  return (
    <button
      type="button"
      onClick={handleClaim}
      disabled={claiming}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 backdrop-blur-md transition-all duration-200 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Coins size={16} />
      <span>{claiming ? '领取中...' : `领取 DAO 收益 ${pendingAmount.toLocaleString()} TAI`}</span>
    </button>
  );
}
