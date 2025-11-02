import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHaptic } from '../../hooks/useHaptic';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { BOTTOM_NAV_ITEMS } from './navConfig';

export function GlassBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vibrate } = useHaptic();
  const { t } = useI18n('nav');
  const { mode } = useTheme();
  const isLight = mode === 'light';

  const activeRing = isLight
    ? 'shadow-[0_0_18px_rgba(251,191,36,0.38)] text-amber-500'
    : 'shadow-[0_0_12px_rgba(251,191,36,0.75)] text-amber-100';
  const inactiveText = isLight
    ? 'text-slate-500 hover:text-slate-900'
    : 'text-slate-300/70 hover:text-slate-100';
  const containerTone = isLight
    ? 'border border-slate-900/12 bg-white/90 text-slate-900 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.28)]'
    : 'border border-white/10 bg-white/5 text-white';

  const activeKey = useMemo(() => {
    const [root] = location.pathname.split('/').filter(Boolean);
    if (!root) return 'home';
    if (root === 'detail') return 'home';
    for (const item of BOTTOM_NAV_ITEMS) {
      if (item.path === '/' && location.pathname === '/') {
        return item.key;
      }
      if (item.path !== '/' && location.pathname.startsWith(item.path)) {
        return item.key;
      }
    }
    return 'home';
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;
    vibrate(8);
    navigate(path);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4">
      <div className={`glass-nav mx-auto flex w-[min(440px,94%)] items-center justify-around rounded-2xl px-4 py-3 backdrop-blur-xl ${containerTone}`}>
        {BOTTOM_NAV_ITEMS.map(({ key, labelKey, icon: Icon, path, highlight }) => {
          const isActive = key === activeKey;
          const label = t(labelKey);

          if (highlight) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(path)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 shadow-lg shadow-amber-500/30 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 active:scale-95"
                aria-label={label}
              >
                <Icon className="h-6 w-6 text-[#0f172a]" />
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleNavigate(path)}
              className="flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-2 py-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 active:scale-95"
              aria-label={label}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? activeRing : inactiveText}`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? (isLight ? 'text-amber-500' : 'text-amber-200') : isLight ? 'text-slate-500' : 'text-slate-300/60'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
