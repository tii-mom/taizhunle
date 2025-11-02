import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { GlassButtonGlass } from './GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

type GlassModalGlassProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function GlassModalGlass({ open, title, description, onClose, children, footer }: GlassModalGlassProps) {
  const { t } = useI18n('common');
  const { mode } = useTheme();
  const isLight = mode === 'light';
  if (!open) {
    return null;
  }

  const showHeader = Boolean(title || description || onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xl px-4 py-6">
      <div className="glass-modal max-w-lg" data-theme={mode}>
        {showHeader ? (
          <header className="glass-modal-header">
            <div>
              {title ? (
                <h2 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h2>
              ) : null}
              {description ? (
                <p className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-white/70'}`}>{description}</p>
              ) : null}
            </div>
            {onClose ? (
              <GlassButtonGlass
                variant="ghost"
                aria-label={t('close')}
                className="h-10 w-10 rounded-full !px-0 !py-0"
                onClick={onClose}
              >
                <X className={`h-4 w-4 ${isLight ? 'text-slate-700' : ''}`} />
              </GlassButtonGlass>
            ) : null}
          </header>
        ) : null}
        <div className={`glass-modal-body ${showHeader ? '' : '!pt-0'}`.trim()}>{children}</div>
        {footer ? <footer className="glass-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
