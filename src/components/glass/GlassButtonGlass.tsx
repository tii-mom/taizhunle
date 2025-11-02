import { forwardRef, useMemo } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

type GlassButtonGlassProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const GlassButtonGlass = forwardRef<HTMLButtonElement, GlassButtonGlassProps>(
  ({ variant = 'primary', className = '', children, type = 'button', ...rest }, ref) => {
    const { mode } = useTheme();
    const isLight = mode === 'light';

    const variantClass = useMemo(() => {
      const base = 'glass-button inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200';
      if (variant === 'primary') {
        return `${base} glass-button-primary rounded-2xl px-5 py-3 text-sm ${
          isLight ? 'text-slate-900' : 'text-slate-900'
        } shadow-[0_10px_30px_-12px_rgba(251,191,36,0.55)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_rgba(251,191,36,0.55)] active:translate-y-0`;
      }
      if (variant === 'secondary') {
        return `${base} rounded-2xl px-4 py-2 text-sm ${
          isLight
            ? 'border border-slate-900/10 bg-white/80 text-slate-900 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.35)] hover:border-slate-900/20 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]'
            : 'glass-button-secondary text-white hover:text-amber-100'
        } active:translate-y-0.5`;
      }
      return `${base} glass-button-ghost rounded-2xl px-4 py-2 text-sm ${
        isLight
          ? 'border border-slate-900/5 bg-white/65 text-slate-800 hover:border-slate-900/15 hover:bg-white'
          : 'text-white/70 hover:text-white'
      }`;
    }, [isLight, variant]);

    return (
      <button
        ref={ref}
        type={type}
        className={`${variantClass} ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

GlassButtonGlass.displayName = 'GlassButtonGlass';
