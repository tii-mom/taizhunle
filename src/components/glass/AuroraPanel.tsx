import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

import { useTheme } from '@/providers/ThemeProvider';

const NIGHT_VARIANTS = {
  neutral: 'border-white/12 from-white/14 via-white/6 to-transparent shadow-[0_26px_48px_-40px_rgba(59,130,246,0.28)]',
  amber: 'border-amber-300/30 from-amber-400/18 via-amber-500/8 to-transparent shadow-[0_30px_52px_-42px_rgba(251,191,36,0.6)]',
  emerald: 'border-emerald-400/25 from-emerald-500/16 via-emerald-500/8 to-transparent shadow-[0_32px_58px_-46px_rgba(16,185,129,0.55)]',
  cyan: 'border-cyan-300/25 from-cyan-400/16 via-cyan-500/8 to-transparent shadow-[0_32px_58px_-46px_rgba(34,211,238,0.45)]',
} as const;

const DAY_VARIANTS = {
  neutral: 'border-slate-200/70 from-white/96 via-slate-100/55 to-white/20 shadow-[0_24px_48px_-36px_rgba(203,213,225,0.55)]',
  amber: 'border-amber-200/70 from-amber-100/85 via-amber-50/40 to-white/10 shadow-[0_26px_52px_-40px_rgba(251,191,36,0.35)]',
  emerald: 'border-emerald-200/60 from-emerald-50/75 via-emerald-50/35 to-white/10 shadow-[0_26px_52px_-40px_rgba(16,185,129,0.28)]',
  cyan: 'border-cyan-200/60 from-cyan-50/80 via-cyan-50/35 to-white/10 shadow-[0_26px_52px_-40px_rgba(34,211,238,0.28)]',
} as const;

type AuroraVariant = keyof typeof NIGHT_VARIANTS;

type AuroraPanelProps = {
  children: ReactNode;
  variant?: AuroraVariant;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function AuroraPanel({ children, variant = 'neutral', className, ...rest }: AuroraPanelProps) {
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const tone = isLight ? DAY_VARIANTS[variant] : NIGHT_VARIANTS[variant];

  return (
    <div
      {...rest}
      className={clsx(
        'relative overflow-hidden rounded-3xl border bg-gradient-to-br px-6 py-6 backdrop-blur-2xl transition-colors duration-300',
        tone,
        className,
      )}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-300',
          isLight
            ? 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]',
        )}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
