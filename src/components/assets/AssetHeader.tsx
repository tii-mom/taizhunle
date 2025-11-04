import { useMemo, useState, type SyntheticEvent } from 'react';
import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, ClipboardList, Download, Repeat, Upload } from 'lucide-react';
import { TonConnectButton } from '@tonconnect/ui-react';

import { useCountUp } from '../../hooks/useCountUp';
import { useTAIPrice } from '../../hooks/useTAIPrice';
import { useAssetData } from '../../hooks/useAssetData';
import { formatNumber } from '../../utils/format';
import { useHaptic } from '../../hooks/useHaptic';
import { ChargeModalGlass } from '../glass/ChargeModalGlass';
import { WithdrawModalGlass } from '../glass/WithdrawModalGlass';
import { ExchangeModalGlass } from '../glass/ExchangeModalGlass';
import { AuroraPanel } from '../glass/AuroraPanel';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';
import { GlassModalGlass } from '../glass/GlassModalGlass';
import { GlassButtonGlass } from '../glass/GlassButtonGlass';

type TransactionType = 'charge' | 'withdraw' | 'exchange' | null;

export function AssetHeader() {
  const { t, locale } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const { balance, change24h, tonBalance, tonChange24h, isLoading, refetch } = useAssetData();
  const { price: taiPrice, isLoading: isPriceLoading } = useTAIPrice();
  const [modalType, setModalType] = useState<TransactionType>(null);
  const [taiDetailOpen, setTaiDetailOpen] = useState(false);
  const [tonDetailOpen, setTonDetailOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const animatedBalance = useCountUp(balance);
  const animatedPrice = useCountUp(taiPrice);
  const animatedChange = useCountUp(change24h);
  const animatedTonBalance = useCountUp(tonBalance);

  const isPositive = change24h >= 0;
  const isTonPositive = tonChange24h >= 0;
  const isLight = mode === 'light';
  const labelTone = isLight ? 'text-slate-500' : 'text-white/60';
  const primaryValueTone = isLight ? 'text-slate-900' : 'text-white';
  const accentNumberTone = isLight ? 'text-amber-500' : 'text-amber-200';
  const usdTone = isLight ? 'text-slate-500' : 'text-white/60';
  const statCardTone = isLight
    ? 'border-white/60 bg-white/75 text-slate-700 shadow-[0_18px_40px_-32px_rgba(148,163,184,0.55)]'
    : 'border-white/12 bg-white/8 text-white/80';
  const actionButtonTone = isLight
    ? 'border-white/60 bg-white/75 text-slate-700 hover:border-amber-200 hover:text-amber-600'
    : 'border-white/12 bg-white/8 text-white/80 hover:border-amber-300/40 hover:text-amber-100';
  const metricButtonTone = isLight
    ? 'border-white/55 bg-white/80 text-slate-800 shadow-[0_18px_40px_-26px_rgba(148,163,184,0.55)] hover:border-amber-200 hover:shadow-[0_0_32px_rgba(255,255,255,0.35)]'
    : 'border-white/18 bg-white/12 text-white/90 hover:border-white/35 hover:shadow-[0_0_32px_rgba(255,255,255,0.35)]';
  const tonButtonTone = isLight
    ? 'border-white/45 bg-white/70 text-slate-700 hover:border-cyan-200 hover:shadow-[0_0_28px_rgba(165,243,252,0.35)]'
    : 'border-white/16 bg-white/8 text-white/80 hover:border-cyan-400/40 hover:shadow-[0_0_28px_rgba(165,243,252,0.35)]';
  const taiChangeTone = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const tonChangeTone = isTonPositive ? 'text-emerald-300' : 'text-rose-300';

  const records = useMemo(
    () => [
      { id: 'rec-1', asset: 'TAI', type: 'deposit', direction: 'in', amount: 2500.45, timestamp: '2025-11-15T14:32:00Z' },
      { id: 'rec-2', asset: 'TAI', type: 'reward', direction: 'in', amount: 320.12, timestamp: '2025-11-14T20:10:00Z' },
      { id: 'rec-3', asset: 'TON', type: 'gas', direction: 'out', amount: 3.25, timestamp: '2025-11-13T08:45:00Z' },
      { id: 'rec-4', asset: 'TON', type: 'withdraw', direction: 'out', amount: 15.0, timestamp: '2025-11-12T18:05:00Z' },
    ],
    [],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale.startsWith('zh') ? 'zh-CN' : 'en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  const handleTransaction = (type: 'charge' | 'withdraw' | 'exchange') => {
    vibrate();
    setModalType(type);
  };

  const handleTonConnectClick = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleTransactionSubmit = async (values: unknown) => {
    console.log('Transaction:', modalType, values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="space-y-6">
      <AuroraPanel
        variant="amber"
        className={clsx('space-y-6 rounded-[32px] border px-6 py-6 sm:px-8', isLight ? 'text-slate-800' : 'text-white/85')}
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setTaiDetailOpen(true)}
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setTaiDetailOpen(true);
                }
              }}
              className={clsx(
                'flex flex-1 cursor-pointer flex-col gap-4 rounded-[28px] border px-6 py-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300/70',
                metricButtonTone,
              )}
            >
              <div className="flex items-center justify-between">
                <span className={clsx('text-xs uppercase tracking-[0.35em]', labelTone)}>{t('balance')}</span>
                <div
                  onClick={handleTonConnectClick}
                  onKeyDown={handleTonConnectClick}
                  onKeyUp={handleTonConnectClick}
                  onMouseDown={handleTonConnectClick}
                  onTouchStart={handleTonConnectClick}
                  onFocus={handleTonConnectClick}
                >
                  <TonConnectButton />
                </div>
              </div>
              <span className={clsx('font-mono text-4xl font-bold tracking-tight', accentNumberTone)}>
                {formatNumber(animatedBalance, 2)} TAI
              </span>
              <span className={clsx('flex items-center gap-1 text-sm', taiChangeTone)}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {formatNumber(animatedChange, 2)}%
              </span>
              <span className={clsx('text-xs text-slate-400', isLight ? 'text-slate-500' : 'text-white/50')}>
                {t('topBarHint')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTonDetailOpen(true)}
              className={clsx(
                'flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition-all duration-200 lg:max-w-sm',
                tonButtonTone,
              )}
            >
              <span className="font-mono text-2xl font-semibold text-current">
                {formatNumber(animatedTonBalance, 2)} TON
              </span>
              <span className={clsx('text-sm font-medium', tonChangeTone)}>
                {isTonPositive ? '+' : ''}
                {formatNumber(tonChange24h, 2)}%
              </span>
            </button>
          </div>

          <div className={clsx('grid gap-4', 'md:grid-cols-2')}
          >
            <div
              className={clsx(
                'rounded-[26px] border px-5 py-4 transition-colors',
                statCardTone,
                'md:col-span-2'
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`mb-2 text-xs uppercase tracking-[0.3em] ${labelTone}`}>{t('usdt')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={clsx('font-mono text-xl font-semibold', primaryValueTone)}>
                      {isPriceLoading ? '...' : formatNumber(animatedPrice, 4)}
                    </span>
                    <span className={clsx('text-xs', usdTone)}>USDT</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <ArrowUpRight size={16} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={16} className="text-rose-400" />
                  )}
                  <span className={clsx('font-mono text-xl font-semibold', isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                    {isPositive ? '+' : ''}
                    {formatNumber(animatedChange, 2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => handleTransaction('charge')}
              className={clsx(
                'flex h-16 items-center justify-center gap-2 rounded-[24px] text-sm font-semibold transition-colors',
                actionButtonTone,
              )}
            >
              <Download size={18} />
              {t('deposit')}
            </button>
            <button
              type="button"
              onClick={() => handleTransaction('withdraw')}
              className={clsx(
                'flex h-16 items-center justify-center gap-2 rounded-[24px] text-sm font-semibold transition-colors',
                actionButtonTone,
              )}
            >
              <Upload size={18} />
              {t('withdraw')}
            </button>
            <button
              type="button"
              onClick={() => handleTransaction('exchange')}
              className={clsx(
                'flex h-16 items-center justify-center gap-2 rounded-[24px] text-sm font-semibold transition-colors',
                actionButtonTone,
              )}
            >
              <Repeat size={18} />
              {t('exchange')}
            </button>
            <button
              type="button"
              onClick={() => setRecordModalOpen(true)}
              className={clsx(
                'flex h-16 items-center justify-center gap-2 rounded-[24px] text-sm font-semibold transition-colors',
                actionButtonTone,
              )}
            >
              <ClipboardList size={18} />
              {t('records')}
            </button>
          </div>
        </div>
      </AuroraPanel>

      <GlassModalGlass
        open={taiDetailOpen}
        title={t('balance')}
        description={t('taiDetailHint')}
        onClose={() => setTaiDetailOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">TAI</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-semibold text-white">{formatNumber(balance, 2)}</span>
              <span className={clsx('text-sm font-semibold', taiChangeTone)}>
                {isPositive ? '+' : ''}
                {formatNumber(change24h, 2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <GlassButtonGlass variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? t('refreshing') : t('refresh')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={() => setTaiDetailOpen(false)}>{t('common:close')}</GlassButtonGlass>
          </div>
        </div>
      </GlassModalGlass>

      <GlassModalGlass
        open={tonDetailOpen}
        title={t('tonBalance')}
        description={t('tonDetailHint')}
        onClose={() => setTonDetailOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">TON</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-semibold text-white">{formatNumber(tonBalance, 2)}</span>
              <span className={clsx('text-sm font-semibold', tonChangeTone)}>
                {isTonPositive ? '+' : ''}
                {formatNumber(tonChange24h, 2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <GlassButtonGlass variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? t('refreshing') : t('refresh')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={() => setTonDetailOpen(false)}>{t('common:close')}</GlassButtonGlass>
          </div>
        </div>
      </GlassModalGlass>

      <GlassModalGlass
        open={recordModalOpen}
        title={t('recordTitle')}
        description={t('recordSubtitle')}
        onClose={() => setRecordModalOpen(false)}
      >
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {t('recordEmpty')}
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
              >
                <div>
                  <p className="font-semibold text-white">{record.asset}</p>
                  <p className="text-xs text-white/60">
                    {record.type === 'deposit' && t('recordDeposit')}
                    {record.type === 'withdraw' && t('recordWithdraw')}
                    {record.type === 'reward' && t('recordReward')}
                    {record.type === 'gas' && t('recordGas')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={clsx('font-mono text-sm font-semibold', record.direction === 'in' ? 'text-emerald-300' : 'text-rose-300')}>
                    {record.direction === 'in' ? '+' : '-'}
                    {formatNumber(record.amount, 2)} {record.asset}
                  </p>
                  <p className="text-xs text-white/50">{dateFormatter.format(new Date(record.timestamp))}</p>
                </div>
              </div>
            ))
          )}
          <div className="flex items-center justify-end gap-3">
            <GlassButtonGlass variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? t('refreshing') : t('recordRefresh')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={() => setRecordModalOpen(false)}>{t('common:close')}</GlassButtonGlass>
          </div>
        </div>
      </GlassModalGlass>

      {modalType === 'charge' ? (
        <ChargeModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
      {modalType === 'withdraw' ? (
        <WithdrawModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
      {modalType === 'exchange' ? (
        <ExchangeModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
    </div>
  );
}
