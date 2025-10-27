import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { TopAggregate } from './TopAggregate';

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 pt-32 lg:pb-0 lg:pt-0">
      <TopAggregate />
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
