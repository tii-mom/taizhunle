/**
 * 玻璃页面布局
 */
import { type ReactNode, useMemo } from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { GlassBottomNav } from './GlassBottomNav';

type GlassPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPageLayout({ children, className }: GlassPageLayoutProps) {
  const { mode } = useTheme();

  const { wrapperClass, accentOverlays } = useMemo(() => {
    if (mode === 'light') {
      return {
        wrapperClass:
          'bg-gradient-to-br from-[#f9f7f1] via-[#f1ece5] to-[#fefbf7] text-slate-900',
        accentOverlays: [
          'bg-amber-400/20',
          'bg-emerald-400/15',
          'bg-cyan-400/15',
        ],
      } as const;
    }

    return {
      wrapperClass: 'bg-gradient-to-br from-[#030711] via-[#0b1120] to-[#020617] text-white',
      accentOverlays: ['bg-amber-500/10', 'bg-emerald-500/5', 'bg-cyan-400/5'],
    } as const;
  }, [mode]);

  return (
    <div className={`relative min-h-screen ${wrapperClass}`} data-theme={mode}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`pointer-events-none absolute left-1/2 top-0 h-72 w-[110%] -translate-x-1/2 rounded-[40%] blur-3xl ${accentOverlays[0]}`} />
        <div className={`pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full blur-3xl ${accentOverlays[1]}`} />
        <div className={`pointer-events-none absolute -right-10 top-40 h-72 w-72 rounded-full blur-3xl ${accentOverlays[2]}`} />
      </div>
      <div className={`relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-6 sm:px-6 ${className ?? ''}`}>
        {children}
      </div>
      <GlassBottomNav />
    </div>
  );
}
