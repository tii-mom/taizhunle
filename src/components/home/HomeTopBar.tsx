import clsx from 'clsx';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAssetData } from '@/hooks/useAssetData';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { formatNumber } from '@/utils/format';
import { GlassModalGlass } from '@/components/glass/GlassModalGlass';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';

export type HomeTopBarProps = {
  onSearchOpen: () => void;
};

export function HomeTopBar({ onSearchOpen }: HomeTopBarProps) {
  const { mode, toggle } = useTheme();
  const isLight = mode === 'light';
  const { t, locale, changeLanguage } = useI18n(['home', 'assets', 'common']);
  const { balance, change24h, tonBalance, tonChange24h, refetch, isLoading } = useAssetData();
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [tonModalOpen, setTonModalOpen] = useState(false);

  const nextLocale = locale.startsWith('zh') ? 'en' : 'zh';
  const languageLabel = locale.startsWith('zh') ? 'En' : '中';
  const themeLabel = isLight ? '🌙' : '☀️';
  const formattedBalance = useMemo(() => formatNumber(balance, 2), [balance]);
  const formattedChange = useMemo(() => `${change24h >= 0 ? '+' : ''}${formatNumber(change24h, 2)}%`, [change24h]);
  const formattedTonBalance = useMemo(() => formatNumber(tonBalance, 2), [tonBalance]);
  const formattedTonChange = useMemo(
    () => `${tonChange24h >= 0 ? '+' : ''}${formatNumber(tonChange24h, 2)}%`,
    [tonChange24h],
  );

  const chipClass = clsx(
    'flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm transition-transform duration-200',
    isLight
      ? 'border-white/55 bg-white/75 text-slate-700 shadow-[0_14px_30px_-24px_rgba(148,163,184,0.55)] hover:border-white hover:shadow-[0_0_22px_rgba(255,255,255,0.35)] hover:scale-[1.02]'
      : 'border-white/18 bg-white/12 text-white/85 hover:border-white/40 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:scale-[1.02]',
  );

  return (
    <div
      className={clsx(
        'flex flex-col gap-3 rounded-[28px] border px-5 py-4 backdrop-blur-2xl transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        isLight
          ? 'border-white/40 bg-white/35 text-slate-800'
          : 'border-white/12 bg-white/8 text-white/90',
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className={chipClass}>
          <TonConnectButton />
        </div>
        <button
          type="button"
          onClick={() => setBalanceModalOpen(true)}
          className={clsx(chipClass, 'px-4')}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-amber-300/90">TAI</span>
          <span className="font-mono text-base font-semibold">{formattedBalance}</span>
          <span className={change24h >= 0 ? 'text-emerald-300 text-xs' : 'text-rose-300 text-xs'}>{formattedChange}</span>
        </button>
        <button
          type="button"
          onClick={() => setTonModalOpen(true)}
          className={clsx(chipClass, 'px-4')}
        >
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-300/90">TON</span>
          <span className="font-mono text-base font-semibold">{formattedTonBalance}</span>
          <span className={tonChange24h >= 0 ? 'text-emerald-300 text-xs' : 'text-rose-300 text-xs'}>
            {formattedTonChange}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => changeLanguage(nextLocale)}
          className={clsx(chipClass, 'w-[58px] justify-center text-base font-semibold')}
        >
          {languageLabel}
        </button>
        <button
          type="button"
          onClick={toggle}
          className={clsx(chipClass, 'w-[58px] justify-center text-base font-semibold')}
        >
          {themeLabel}
        </button>
        <button
          type="button"
          onClick={onSearchOpen}
          className={clsx(chipClass, 'justify-center gap-2 px-5 text-base font-semibold')}
        >
          <Search className="h-4 w-4" />
          <span>{t('home:topbar.search')}</span>
        </button>
      </div>

      <GlassModalGlass
        open={balanceModalOpen}
        title={t('home:topbar.balanceTitle')}
        description={t('home:topbar.balanceSubtitle')}
        onClose={() => setBalanceModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">TAI</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-white">{formattedBalance}</span>
              <span className={change24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{formattedChange}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <GlassButtonGlass variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? t('home:topbar.refreshing') : t('home:topbar.refresh')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={() => setBalanceModalOpen(false)}>
              {t('common:close')}
            </GlassButtonGlass>
          </div>
        </div>
      </GlassModalGlass>

      <GlassModalGlass
        open={tonModalOpen}
        title={t('home:topbar.tonTitle')}
        description={t('home:topbar.tonSubtitle')}
        onClose={() => setTonModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">TON</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-white">{formattedTonBalance}</span>
              <span className={tonChange24h >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{formattedTonChange}</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <GlassButtonGlass variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? t('home:topbar.refreshing') : t('home:topbar.refresh')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={() => setTonModalOpen(false)}>
              {t('common:close')}
            </GlassButtonGlass>
          </div>
        </div>
      </GlassModalGlass>
    </div>
  );
}
