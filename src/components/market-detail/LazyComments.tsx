import { Suspense, lazy } from 'react';

import { GlassCard } from '@/components/glass/GlassCard';
import { useIntersectionOnce } from '@/hooks/useIntersectionOnce';

const CommentsCard = lazy(() =>
  import('./CommentsCard').then((module) => ({ default: module.CommentsCard })),
);

type LazyCommentsProps = {
  marketId: string;
};

function CommentsSkeleton() {
  return (
    <GlassCard className="space-y-4 border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
      <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/6" />
        ))}
      </div>
    </GlassCard>
  );
}

export function LazyComments({ marketId }: LazyCommentsProps) {
  const { ref, hasIntersected } = useIntersectionOnce<HTMLDivElement>({ rootMargin: '200px 0px' });

  return (
    <div ref={ref}>
      {hasIntersected ? (
        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsCard marketId={marketId} />
        </Suspense>
      ) : (
        <CommentsSkeleton />
      )}
    </div>
  );
}
