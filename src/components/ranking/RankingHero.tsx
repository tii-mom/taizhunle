import { Trophy } from 'lucide-react';

import { GlassCard } from '../glass/GlassCard';

type Props = {
  title: string;
  subtitle: string;
};

export function RankingHero({ title, subtitle }: Props) {
  return (
    <GlassCard className="overflow-hidden p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-white/5 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-400/15">
            <Trophy size={28} className="text-amber-200" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]">{title}</h1>
            <p className="mt-2 text-white/70">{subtitle}</p>
          </div>
        </div>
        <div className="glass-tile flex items-center gap-2 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-amber-200">60s</span>
        </div>
      </div>
    </GlassCard>
  );
}
