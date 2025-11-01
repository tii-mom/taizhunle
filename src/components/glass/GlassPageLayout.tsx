/**
 * 玻璃页面布局
 */
import { type ReactNode } from 'react';
import { GlassBottomNav } from './GlassBottomNav';

type GlassPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPageLayout({ children, className }: GlassPageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#030711] via-[#0b1120] to-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[110%] -translate-x-1/2 rounded-[40%] bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-40 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>
      <div className={`relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-6 sm:px-6 ${className ?? ''}`}>
        {children}
      </div>
      <GlassBottomNav />
    </div>
  );
}
