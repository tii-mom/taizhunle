import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, ShieldCheck, X } from 'lucide-react';

import { useHaptic } from '../../hooks/useHaptic';
import { useI18n } from '../../hooks/useI18n';
import { CountUp } from '../glass/CountUp';
import { useTheme } from '../../providers/ThemeProvider';

export type AssetTransactionVariant = 'charge' | 'withdraw' | 'exchange';

type BaseProps = {
  open: boolean;
  variant: AssetTransactionVariant;
  balance: number;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

type FormValues = {
  amount: number;
  address?: string;
  fromCurrency?: string;
  toCurrency?: string;
};

const baseSchema = z.object({
  amount: z.number().min(0.01, 'amount'),
  address: z.string().optional(),
  fromCurrency: z.string().optional(),
  toCurrency: z.string().optional(),
});

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function AssetTransactionModal({ open, variant, balance, onClose, onSubmit }: BaseProps) {
  const { t, locale } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const [remaining, setRemaining] = useState(FIVE_MINUTES_MS);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      amount: 0,
      fromCurrency: 'TAI',
      toCurrency: 'USDT',
    },
  });

  const fromCurrency = watch('fromCurrency');
  const toCurrency = watch('toCurrency');

  useEffect(() => {
    if (!open) return;
    setRemaining(FIVE_MINUTES_MS);
    const start = Date.now();
    const timer = window.setInterval(() => {
      setRemaining(Math.max(FIVE_MINUTES_MS - (Date.now() - start), 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, variant]);

  useEffect(() => {
    if (!open) {
      reset({ amount: 0, fromCurrency: 'TAI', toCurrency: 'USDT', address: '' });
    }
  }, [open, reset]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const countdownText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const buttonTone = 'transition-colors duration-100';

  const icon = useMemo(() => {
    switch (variant) {
      case 'charge':
        return <ArrowDownCircle className="h-6 w-6 text-amber-300" />;
      case 'withdraw':
        return <ArrowUpCircle className="h-6 w-6 text-emerald-300" />;
      case 'exchange':
        return <RefreshCw className="h-6 w-6 text-cyan-300" />;
      default:
        return null;
    }
  }, [variant]);

  const title = useMemo(() => {
    switch (variant) {
      case 'charge':
        return t('modal.charge.title');
      case 'withdraw':
        return t('modal.withdraw.title');
      case 'exchange':
        return t('modal.exchange.title');
    }
  }, [variant, t]);

  const confirmLabel = useMemo(() => {
    switch (variant) {
      case 'charge':
        return t('modal.charge.cta');
      case 'withdraw':
        return t('modal.withdraw.cta');
      case 'exchange':
        return t('modal.exchange.cta');
    }
  }, [variant, t]);

  const highlight = remaining <= FIVE_MINUTES_MS;

  const modalBackground = mode === 'light' ? 'bg-slate-900/70' : 'bg-slate-950/80';

  const handleInternalSubmit = async (values: FormValues) => {
    vibrate(10);
    await onSubmit(values);
    onClose();
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className={clsx('fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl', modalBackground)}>
      <form
        lang={locale}
        onSubmit={handleSubmit(handleInternalSubmit)}
        className="glass-modal w-full max-w-[min(520px,calc(100vw-32px))] space-y-6"
      >
        <header className="glass-modal-header">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                {t('modal.gas', '自付 Gas · 仅一次签名')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className="glass-button-ghost h-10 w-10 !rounded-full !px-0 !py-0 text-white/60 hover:text-white"
            disabled={isSubmitting}
            aria-label={t('modal.close', '关闭')}
          >
            <X size={18} />
          </button>
        </header>

        <section className="rounded-[26px] border border-white/10 bg-white/[0.05] px-6 py-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">{t('balance')}</p>
              <CountUp end={balance} className="font-mono text-2xl font-semibold text-amber-200" suffix=" TAI" />
            </div>
            <div
              className={clsx(
                'rounded-full border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
                highlight && 'animate-pulse'
              )}
            >
              {t('modal.countdown', { time: countdownText })}
            </div>
          </div>
        </section>

        <div className="glass-modal-body space-y-4 text-white/80">
          <label className="block text-sm">
            {t('amount')}
            <div className="relative mt-2">
              <input
                type="number"
                step="0.01"
                className={clsx('glass-input pl-4 font-mono', errors.amount && 'animate-shake border-rose-400/40 focus:ring-rose-300/40')}
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50">TAI</span>
            </div>
            {errors.amount ? <span className="mt-1 block text-xs text-rose-300">{t(`errors.${errors.amount.message}`)}</span> : null}
          </label>

          {variant === 'exchange' ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                {t('from')}
                <select className="glass-select mt-2" {...register('fromCurrency')}>
                  <option value="TAI">TAI</option>
                  <option value="USDT">USDT</option>
                </select>
              </label>
              <label className="block text-sm">
                {t('to')}
                <select className="glass-select mt-2" {...register('toCurrency')}>
                  <option value="USDT">USDT</option>
                  <option value="TAI">TAI</option>
                </select>
              </label>
            </div>
          ) : null}

          {variant === 'withdraw' ? (
            <label className="block text-sm">
              {t('withdrawAddress')}
              <input
                type="text"
                className="glass-input mt-2 font-mono text-xs"
                placeholder="0x..."
                {...register('address')}
              />
            </label>
          ) : null}

          <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/55">
              <ShieldCheck size={14} className="text-amber-200" />
              <span>{t('modal.selfPay', '矿工费由用户自付')}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>{t('modal.estimate', '预计矿工费')}</span>
              <span className="font-mono text-white">~0.003 TON</span>
            </div>
            {variant === 'exchange' ? (
              <div className="mt-2 flex items-center justify-between">
                <span>{t('modal.rate', '兑换汇率')}</span>
                <span className="font-mono text-white">1 {fromCurrency} ≈ 1 {toCurrency}</span>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="glass-modal-footer">
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className={clsx('glass-button-secondary !rounded-full !px-5 !py-2 text-xs', buttonTone)}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx('glass-button-primary !rounded-full !px-6 !py-2 text-xs disabled:opacity-50', buttonTone)}
          >
            {confirmLabel}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
