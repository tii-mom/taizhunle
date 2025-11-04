import clsx from 'clsx';
import { Copy, Wallet, WalletMinimal } from 'lucide-react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/providers/ThemeProvider';

export type WalletSummaryProps = {
  align?: 'start' | 'end';
  withBalance?: boolean;
  balanceLabel?: string;
  balanceValue?: string;
  onCopy?: (address: string) => void;
  layout?: 'panel' | 'inline';
};

export function WalletSummary({
  align = 'start',
  withBalance = false,
  balanceLabel,
  balanceValue,
  onCopy,
  layout = 'panel',
}: WalletSummaryProps) {
  const wallet = useTonWallet();
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const address = wallet?.account?.address;
  const shortened = useMemo(() => (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''), [address]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!address) {
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.(address);
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
    }
  };

  const renderDisconnected = () => {
    if (layout === 'inline') {
      return (
        <div
          className={clsx(
            'flex items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm',
            isLight
              ? 'border-slate-200/70 bg-white/70 text-slate-600'
              : 'border-white/15 bg-white/10 text-white/80',
          )}
        >
          <div className="flex items-center gap-2">
            <WalletMinimal className={isLight ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-emerald-200'} />
            <span>{isLight ? '连接 TonConnect 钱包' : 'Connect Ton wallet'}</span>
          </div>
          <TonConnectButton />
        </div>
      );
    }

    return (
      <div
        className={clsx(
          'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3',
          isLight
            ? 'border-slate-200 bg-white/95 text-slate-600 shadow-[0_20px_36px_-28px_rgba(148,163,184,0.45)]'
            : 'border-white/15 bg-white/10 text-white/80',
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <WalletMinimal className={isLight ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-emerald-200'} />
          <span>{isLight ? '连接 TonConnect 钱包' : 'Connect Ton wallet'}</span>
        </div>
        <TonConnectButton />
      </div>
    );
  };

  if (!address) {
    return renderDisconnected();
  }

  if (layout === 'inline') {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 rounded-full border px-4 py-2 text-sm',
          isLight
            ? 'border-slate-200/80 bg-white/70 text-slate-700'
            : 'border-white/15 bg-white/10 text-white/80',
        )}
      >
        <div className="flex items-center gap-2">
          <Wallet className={isLight ? 'h-4 w-4 text-emerald-500' : 'h-4 w-4 text-emerald-200'} />
          <span className="font-mono text-sm">{shortened}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={clsx(
            'flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors',
            isLight
              ? 'border-slate-200 bg-white/80 hover:border-slate-400 hover:text-slate-900'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:text-white',
          )}
        >
          <Copy className="h-3 w-3" />
          {copied ? (isLight ? '已复制' : 'Copied') : (isLight ? '复制' : 'Copy')}
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors',
        align === 'end' ? 'justify-end' : 'justify-between',
        isLight
          ? 'border-slate-200 bg-white/95 text-slate-700 shadow-[0_20px_36px_-28px_rgba(148,163,184,0.45)]'
          : 'border-white/15 bg-white/10 text-white/80',
      )}
    >
      <div className="flex items-center gap-2">
        <Wallet className={isLight ? 'h-4 w-4 text-emerald-500' : 'h-4 w-4 text-emerald-200'} />
        <span className="font-mono text-sm">{shortened}</span>
      </div>
      {withBalance && balanceLabel ? (
        <div className={clsx('hidden flex-col text-right text-xs sm:flex', isLight ? 'text-slate-500' : 'text-white/60')}>
          <span>{balanceLabel}</span>
          <span className={clsx('font-mono text-base font-semibold', isLight ? 'text-slate-900' : 'text-white')}>
            {balanceValue}
          </span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleCopy}
        className={clsx(
          'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          isLight
            ? 'border-slate-300 bg-white hover:border-slate-400 hover:text-slate-900'
            : 'border-white/20 bg-white/10 hover:border-white/40 hover:text-white',
        )}
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? (isLight ? '已复制' : 'Copied') : (isLight ? '复制地址' : 'Copy')}
      </button>
    </div>
  );
}
