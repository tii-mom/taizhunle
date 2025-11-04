/**
 * 陪审员徽章组件 - 显示等级和数量
 */
type GoldenHammerProps = {
  count: number;
  level?: 1 | 2 | 3 | 4;
  className?: string;
};

export function GoldenHammer({ count, level = 1, className = '' }: GoldenHammerProps) {
  const levelConfig = {
    1: { emoji: '🥋', color: 'text-gray-400', name: '武林新丁' },
    2: { emoji: '🗡️', color: 'text-orange-500', name: '风尘奇侠' },
    3: { emoji: '⚔️', color: 'text-purple-400', name: '地狱判官' },
    4: { emoji: '⚡', color: 'text-amber-400', name: '天上天下天地无双' },
  };

  const config = levelConfig[level];
  const shouldBlink = count > 0;

  return (
    <div className={`flex items-center gap-1 ${className}`} title={config.name}>
      <span className={`text-2xl ${config.color} ${shouldBlink ? 'animate-pulse' : ''}`}>
        {config.emoji}
      </span>
      {count > 0 && <span className={`text-xs font-semibold ${config.color}`}>{count}</span>}
    </div>
  );
}
