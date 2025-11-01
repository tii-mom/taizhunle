/**
 * 玻璃卡片基础组件
 */
import { type ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function GlassCard({ children, className, onClick }: GlassCardProps) {
  const base = 'glass-card';
  const clickable = onClick ? 'cursor-pointer active:scale-[0.98]' : '';
  const merged = [base, clickable, className].filter(Boolean).join(' ');

  return (
    <div className={merged} onClick={onClick}>
      {children}
    </div>
  );
}

type GlassCardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  const base = 'flex items-start justify-between gap-3 p-4';
  const merged = className ? `${base} ${className}` : base;

  return <div className={merged}>{children}</div>;
}

type GlassCardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
  const base = 'flex items-center justify-between gap-3 border-t border-amber-400/20 p-4';
  const merged = className ? `${base} ${className}` : base;

  return <div className={merged}>{children}</div>;
}
