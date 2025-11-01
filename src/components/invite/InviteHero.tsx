import { TrendingUp, ArrowUp } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { usePulseGlow } from '../../hooks/usePulseGlow';

type Props = {
  title: string;
  subtitle: string;
  refreshNote: string;
  totalEarnings: number;
};

export function InviteHero({ title, subtitle, refreshNote, totalEarnings }: Props) {
  const animatedEarnings = useCountUp(totalEarnings, 1000);
  const shouldGlow = usePulseGlow(totalEarnings);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#10B981]/30 bg-gradient-to-br from-[#10B981]/10 via-surface-glass/60 to-surface-glass/60 p-8 shadow-2xl backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 to-transparent" />
      
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={28} className="text-[#10B981]" />
              <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
            </div>
            <p className="text-lg text-text-secondary">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
            <span className="text-xs font-medium text-[#10B981]">{refreshNote}</span>
          </div>
        </div>

        <div className={`rounded-xl border border-[#10B981]/30 bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 p-6 backdrop-blur-md transition-all duration-500 ${shouldGlow ? 'ring-2 ring-[#10B981]/50 shadow-lg shadow-[#10B981]/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide text-text-secondary">实时收益 / Live Earnings</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-5xl font-bold text-[#10B981]">
                  {Math.floor(animatedEarnings).toLocaleString()}
                </span>
                <span className="text-2xl font-semibold text-[#10B981]/70">TAI</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-full bg-[#10B981]/20 px-4 py-2">
              <ArrowUp size={20} className="text-[#10B981]" />
              <span className="font-mono text-lg font-bold text-[#10B981]">+1.5%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
