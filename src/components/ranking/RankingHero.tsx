import { Trophy } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
};

export function RankingHero({ title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 via-surface-glass/60 to-surface-glass/60 p-8 shadow-2xl backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/5 to-transparent" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy size={32} className="text-[#F59E0B]" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
              <p className="mt-1 text-text-secondary">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#F59E0B]" />
            <span className="text-xs font-medium text-[#F59E0B]">60s</span>
          </div>
        </div>
      </div>
    </section>
  );
}
