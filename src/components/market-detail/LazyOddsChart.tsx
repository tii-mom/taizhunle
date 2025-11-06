import { Suspense, lazy } from 'react';

import { GlassCard } from '@/components/glass/GlassCard';
import { useIntersectionOnce } from '@/hooks/useIntersectionOnce';

type LazyOddsChartProps = {
  marketId: string;
};

const OddsChartCard = lazy(() =>
  import('./OddsChartCard').then((module) => ({ default: module.OddsChartCard })),
);

function OddsChartSkeleton() {
  return (
    <GlassCard className="border border-white/20 bg-white/10 backdrop-blur-2xl">
      <div className="h-[320px] animate-pulse bg-white/5" />
    </GlassCard>
  );
}

export function LazyOddsChart({ marketId }: LazyOddsChartProps) {
  const { ref, hasIntersected } = useIntersectionOnce<HTMLDivElement>({ rootMargin: '200px 0px' });

  return (
    <div ref={ref}>
      {hasIntersected ? (
        <Suspense fallback={<OddsChartSkeleton />}>
          <OddsChartCard marketId={marketId} />
        </Suspense>
      ) : (
        <OddsChartSkeleton />
      )}
    </div>
  );
}
