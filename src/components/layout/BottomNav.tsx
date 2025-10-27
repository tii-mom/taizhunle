import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, Trophy, Wallet } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';

type NavItem = {
  key: string;
  path: string;
  icon: typeof Home;
  highlight?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', path: '/', icon: Home },
  { key: 'earnings', path: '/profile', icon: TrendingUp },
  { key: 'create', path: '/create', icon: PlusCircle, highlight: true },
  { key: 'ranking', path: '/ranking', icon: Trophy },
  { key: 'assets', path: '/red-packet', icon: Wallet },
];

export function BottomNav() {
  const { t } = useTranslation('nav');
  const location = useLocation();
  const navigate = useNavigate();
  const { vibrate } = useHaptic();

  const handleNavigate = (path: string) => {
    vibrate();
    navigate(path);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-surface-glass/70 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-4 py-2">
        {NAV_ITEMS.map(({ key, path, icon: Icon, highlight }) => {
          const isActive = location.pathname === path;
          const label = t(key);

          if (highlight) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(path)}
                className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-light p-3 shadow-lg shadow-accent/30 transition-all duration-200 active:scale-95"
                title={label}
              >
                <Icon size={24} className="text-accent-contrast" />
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleNavigate(path)}
              className="flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95"
              title={label}
            >
              <Icon size={20} className={isActive ? 'text-accent' : 'text-text-secondary'} />
              <span
                className={`max-w-[60px] truncate text-xs ${isActive ? 'font-semibold text-accent' : 'text-text-secondary'}`}
                title={label}
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
