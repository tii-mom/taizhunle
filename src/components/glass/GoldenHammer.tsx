/**
 * 金色锤徽章组件
 */
type GoldenHammerProps = {
  count: number;
  level?: 'gray' | 'bronze' | 'silver' | 'gold';
};

export function GoldenHammer({ count, level = 'gold' }: GoldenHammerProps) {
  const colors = {
    gray: 'text-gray-500',
    bronze: 'text-orange-600',
    silver: 'text-gray-300',
    gold: 'text-amber-400',
  };

  const shouldBlink = count > 0;

  return (
    <div className="flex items-center gap-1">
      <span className={`text-2xl ${colors[level]} ${shouldBlink ? 'animate-pulse' : ''}`}>🔨</span>
      {count > 0 && <span className="text-xs text-amber-400 font-semibold">{count}</span>}
    </div>
  );
}
