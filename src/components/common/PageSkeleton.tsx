import { memo } from 'react';

export const PageSkeleton = memo(() => (
  <div className="animate-pulse space-y-4 rounded-3xl border border-border bg-surface p-10 shadow-surface">
    <div className="h-6 w-1/3 rounded bg-border" />
    <div className="h-4 w-2/3 rounded bg-border" />
    <div className="h-4 w-full rounded bg-border" />
    <div className="grid gap-3 md:grid-cols-2">
      <div className="h-32 rounded-2xl bg-border" />
      <div className="h-32 rounded-2xl bg-border" />
    </div>
    <div className="flex flex-wrap gap-3">
      <div className="h-10 w-24 rounded-full bg-border" />
      <div className="h-10 w-24 rounded-full bg-border" />
      <div className="h-10 w-24 rounded-full bg-border" />
    </div>
  </div>
));

PageSkeleton.displayName = 'PageSkeleton';
