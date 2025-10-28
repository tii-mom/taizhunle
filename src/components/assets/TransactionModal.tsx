import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format';

type TransactionType = 'deposit' | 'withdraw' | 'exchange';

const schema = z.object({
  amount: z.number().min(0.01, 'amount'),
  address: z.string().optional(),
  fromCurrency: z.string().optional(),
  toCurrency: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

export function TransactionModal({ open, type, onClose, onSubmit }: Props) {
  const { t } = useTranslation('assets');
  const { vibrate } = useHaptic();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      address: '',
      fromCurrency: 'TAI',
      toCurrency: 'USDT',
    },
  });

  const amount = watch('amount');
  const fromCurrency = watch('fromCurrency');
  const toCurrency = watch('toCurrency');

  // Mock exchange rate
  const exchangeRate = 1.2318;
  const convertedAmount = type === 'exchange' ? amount * exchangeRate : amount;
  const fee = amount * 0.001; // 0.1% fee
  const finalAmount = convertedAmount - fee;

  if (!open) return null;

  const handleFormSubmit = async (_values: FormValues) => {
    vibrate(10);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    vibrate(10);
    const transactionData = { amount, address: '', fromCurrency, toCurrency };
    await onSubmit(transactionData);
    setStep('success');
    setTimeout(() => {
      onClose();
      setStep('form');
    }, 2000);
  };

  const getIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle size={24} className="text-success" />;
      case 'withdraw':
        return <ArrowUpCircle size={24} className="text-error" />;
      case 'exchange':
        return <RefreshCw size={24} className="text-accent" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'deposit':
        return t('depositTitle');
      case 'withdraw':
        return t('withdrawTitle');
      case 'exchange':
        return t('exchangeTitle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-6 backdrop-blur-sm">
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-text-primary">{getTitle()}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
              setStep('form');
            }}
            className="rounded-lg p-2 transition-all hover:bg-surface-hover active:scale-95"
            disabled={isSubmitting}
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Amount Input */}
            <label className="block text-sm text-text-secondary">
              {t('amount')}
              <input
                type="number"
                step="0.01"
                className={`mt-2 w-full rounded-xl border px-4 py-3 font-mono backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 ${
                  errors.amount
                    ? 'animate-shake border-danger ring-2 ring-danger/40'
                    : 'border-border-light bg-surface-glass/60'
                }`}
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <span className="mt-1 block text-xs text-danger">{t(`errors.${errors.amount.message}`)}</span>
              )}
            </label>

            {/* Exchange Currency Selection */}
            {type === 'exchange' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-text-secondary">
                  {t('from')}
                  <select
                    className="mt-2 w-full rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                    {...register('fromCurrency')}
                  >
                    <option value="TAI">TAI</option>
                    <option value="USDT">USDT</option>
                  </select>
                </label>
                <label className="block text-sm text-text-secondary">
                  {t('to')}
                  <select
                    className="mt-2 w-full rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                    {...register('toCurrency')}
                  >
                    <option value="USDT">USDT</option>
                    <option value="TAI">TAI</option>
                  </select>
                </label>
              </div>
            )}

            {/* Address Input for Withdraw */}
            {type === 'withdraw' && (
              <label className="block text-sm text-text-secondary">
                {t('withdrawAddress')}
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 font-mono text-xs backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50"
                  placeholder="0x..."
                  {...register('address')}
                />
              </label>
            )}

            {/* Info Box */}
            <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
              <div className="space-y-2 text-sm">
                {type === 'exchange' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('exchangeRate')}</span>
                      <span className="font-mono text-text-primary">1 {fromCurrency} = {formatNumber(exchangeRate, 4)} {toCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">{t('youWillGet')}</span>
                      <span className="font-mono font-semibold text-accent">{formatNumber(convertedAmount, 2)} {toCurrency}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t('fee')}</span>
                  <span className="font-mono text-text-primary">{formatNumber(fee, 4)}</span>
                </div>
                <div className="flex justify-between border-t border-border-light pt-2">
                  <span className="font-medium text-text-primary">{t('finalAmount')}</span>
                  <span className="font-mono font-semibold text-accent">{formatNumber(finalAmount, 2)}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-warning" />
              <p className="text-xs text-text-secondary">{t('transactionWarning')}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !amount || amount <= 0}
              className="w-full rounded-xl border border-border-light bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-lg transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-50"
            >
              {t('continue')}
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
              <p className="mb-4 text-center text-sm text-text-secondary">{t('confirmTransaction')}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t('type')}</span>
                  <span className="font-medium text-text-primary">{getTitle()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">{t('amount')}</span>
                  <span className="font-mono font-semibold text-accent">{formatNumber(amount, 2)}</span>
                </div>
                {type === 'exchange' && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('receive')}</span>
                    <span className="font-mono font-semibold text-success">{formatNumber(finalAmount, 2)} {toCurrency}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  vibrate();
                  setStep('form');
                }}
                className="flex-1 rounded-xl border border-border-light bg-surface-glass/60 px-6 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
              >
                {t('back')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-border-light bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-lg transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-50"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-success/20 p-4">
                <CheckCircle2 size={48} className="text-success" />
              </div>
            </div>
            <h4 className="mb-2 text-lg font-semibold text-text-primary">{t('transactionSuccess')}</h4>
            <p className="text-sm text-text-secondary">{t('transactionProcessing')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
