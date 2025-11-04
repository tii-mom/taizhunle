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
  const isLight = mode === 'light';
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
  const headingTone = isLight ? 'text-slate-900' : 'text-white';
  const subHeadingTone = isLight ? 'text-slate-400' : 'text-white/50';
  const cardTone = isLight ? 'border-slate-200 bg-white/90 text-slate-600' : 'border-white/10 bg-white/[0.05] text-white/80';
  const accentText = isLight ? 'text-amber-500' : 'text-amber-200';
  const secondaryTone = isLight ? 'text-slate-600' : 'text-white/70';

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
        className={clsx(
          'glass-modal w-full max-w-[min(520px,calc(100vw-32px))] space-y-6',
          isLight && 'bg-white/95 text-slate-700',
        )}
      >
        <header className="glass-modal-header">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className={clsx('text-lg font-semibold', headingTone)}>{title}</h3>
              <p className={clsx('text-xs uppercase tracking-[0.35em]', subHeadingTone)}>
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
            className={clsx(
              'glass-button-ghost h-10 w-10 !rounded-full !px-0 !py-0',
              isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/60 hover:text-white',
            )}
            disabled={isSubmitting}
            aria-label={t('modal.close', '关闭')}
          >
            <X size={18} />
          </button>
        </header>

        <section className={clsx('rounded-[26px] border px-6 py-5 ring-1', cardTone, isLight ? 'ring-slate-100/60' : 'ring-white/5')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={clsx('text-xs uppercase tracking-[0.35em]', subHeadingTone)}>{t('balance')}</p>
              <CountUp end={balance} className={clsx('font-mono text-2xl font-semibold', accentText)} suffix=" TAI" />
            </div>
            <div
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_0_12px_rgba(251,191,36,0.35)] transition-colors',
                highlight && 'animate-pulse',
                isLight ? 'border-amber-200 bg-amber-100/80 text-amber-700' : 'border-amber-300/40 bg-amber-400/20 text-amber-200'
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
                <select
                  className={clsx('glass-select mt-2', isLight && 'border-slate-200 bg-white/90 text-slate-700')}
                  {...register('fromCurrency')}
                >
                  <option value="TAI">TAI</option>
                  <option value="USDT">USDT</option>
                </select>
              </label>
              <label className="block text-sm">
                {t('to')}
                <select
                  className={clsx('glass-select mt-2', isLight && 'border-slate-200 bg-white/90 text-slate-700')}
                  {...register('toCurrency')}
                >
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
                className={clsx('glass-input mt-2 font-mono text-xs', isLight && 'border-slate-200 bg-white/90 text-slate-700')}
                placeholder="0x..."
                {...register('address')}
              />
            </label>
          ) : null}

          <div className={clsx('rounded-[26px] border p-4 text-sm', cardTone)}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em]">
              <ShieldCheck size={14} className={isLight ? 'text-amber-500' : 'text-amber-200'} />
              <span className={subHeadingTone}>{t('modal.selfPay', '矿工费由用户自付')}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={secondaryTone}>{t('modal.estimate', '预计矿工费')}</span>
              <span className={clsx('font-mono', accentText)}>~0.003 TON</span>
            </div>
            {variant === 'exchange' ? (
              <div className="mt-2 flex items-center justify-between">
                <span className={secondaryTone}>{t('modal.rate', '兑换汇率')}</span>
                <span className={clsx('font-mono', headingTone)}>
                  1 {fromCurrency} ≈ 1 {toCurrency}
                </span>
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
            className={clsx(
              'glass-button-secondary !rounded-full !px-5 !py-2 text-xs',
              buttonTone,
              isLight && '!border-slate-200 !bg-white/90 !text-slate-600 hover:!text-slate-800',
            )}
          >
            {t('modal.cancel', 'cancel')}
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
