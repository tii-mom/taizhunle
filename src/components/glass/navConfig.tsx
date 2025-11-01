import { Hammer, Home, Sparkles, Trophy, Wallet2 } from 'lucide-react';

export type BottomNavItem = {
  key: 'home' | 'dao' | 'create' | 'ranking' | 'assets';
  labelKey: string;
  icon: typeof Home;
  path: string;
  highlight?: boolean;
};

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { key: 'home', labelKey: 'home', icon: Home, path: '/' },
  { key: 'dao', labelKey: 'dao', icon: Hammer, path: '/dao' },
  { key: 'create', labelKey: 'create', icon: Sparkles, path: '/create', highlight: true },
  { key: 'ranking', labelKey: 'ranking', icon: Trophy, path: '/ranking' },
  { key: 'assets', labelKey: 'assets', icon: Wallet2, path: '/assets' },
];
