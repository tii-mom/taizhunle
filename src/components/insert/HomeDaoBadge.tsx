/**
 * Home DAO Badge - 插入式组件
 * 显示预测市场的陪审员数量（金色锤）
 * 插入位置：CardFooter 内
 */

import { useEffect, useState } from 'react';

interface Props {
  betId: string;
}

export function HomeDaoBadge({ betId }: Props) {
  const [juryCount, setJuryCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // 模拟获取陪审员数量
    const fetchJuryCount = async () => {
      try {
        // TODO: 替换为真实 API 调用
        const count = Math.floor(Math.random() * 5);
        setJuryCount(count);
        
        // 如果有陪审员，触发闪烁
        if (count > 0) {
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 2000);
        }
      } catch (error) {
        console.error('Failed to fetch jury count:', error);
      }
    };

    fetchJuryCount();
    // 每30秒刷新一次
    const interval = setInterval(fetchJuryCount, 30000);
    return () => clearInterval(interval);
  }, [betId]);

  if (juryCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 backdrop-blur-md">
      <span className={`text-base ${isFlashing ? 'animate-pulse' : ''}`}>🔨</span>
      <span className="font-mono text-xs font-semibold text-amber-400">{juryCount}</span>
      <span className="text-xs text-amber-400/70">陪审</span>
    </div>
  );
}
