import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTonWallet } from '@tonconnect/ui-react';
import { Sparkles } from 'lucide-react';
import type { TFunction } from 'i18next';

import { GlassButtonGlass } from './GlassButtonGlass';
import { Confetti } from './Confetti';
import type { BetModalData } from '@/queries/bet';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { useBetExecutor } from '@/hooks/useBetExecutor';

const createInvalidTypeErrorMap = (message: string): z.ZodErrorMap => (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    return { message };
  }
  return { message: ctx.defaultError };
};

const createBetSchema = (t: TFunction) =>
  z.object({
    amount: z
      .number({ errorMap: createInvalidTypeErrorMap(t('detail:modal.amountError')) })
      .min(1, t('detail:modal.amountError')),
    side: z.enum(['yes', 'no'], {
      required_error: t('market:quickBet.sideRequired', { defaultValue: '请选择投注方向' }),
      errorMap: createInvalidTypeErrorMap(
        t('market:quickBet.sideRequired', { defaultValue: '请选择投注方向' }),
      ),
    }),
  });

type BetFormValues = z.infer<ReturnType<typeof createBetSchema>>;

type BetModalGlassProps = {
  data: BetModalData;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (values: BetFormValues) => Promise<void> | void;
  onClose?: () => void;
  odds?: {
    yes: number;
    no: number;
  };
};

function shorten(address: string): string {
  if (!address) return '';
  return address.length <= 12 ? address : `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function BetModalGlass({ data, submitLabel, cancelLabel, onSubmit, onClose, odds }: BetModalGlassProps) {
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { t, locale } = useI18n(['market', 'detail', 'dao', 'common']);
  const { mode } = useTheme();
  const schema = useMemo(() => createBetSchema(t), [t]);
  const { execute, isPending } = useBetExecutor();
  const wallet = useTonWallet();

  const defaultValues = useMemo(
    () => ({ amount: data.amount, side: 'yes' }) satisfies BetFormValues,
    [data.amount],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }),
    [locale],
  );

  const quickAmounts = useMemo(() => [100, 500, 1000, 5000], []);
  const maxAmount = useMemo(() => data.maxAmount ?? data.amount, [data.amount, data.maxAmount]);

  const resolvedSubmitLabel = submitLabel ?? t('market:quickBet.submit');
  const resolvedCancelLabel = cancelLabel ?? t('market:quickBet.cancel');
  const rangeText = t('market:quickBet.range', {
    min: numberFormatter.format(data.minAmount),
    max: numberFormatter.format(data.maxAmount),
    currency: data.currency,
  });
  const isLight = mode === 'light';
  const textMuted = isLight ? 'text-slate-600' : 'text-white/70';
  const textMutedSecondary = isLight ? 'text-slate-500' : 'text-slate-200/60';
  const panelBorder = isLight ? 'border-slate-900/12' : 'border-white/10';
  const panelBg = isLight
    ? 'bg-white/90 shadow-[0_26px_40px_-32px_rgba(15,23,42,0.3)]'
    : 'bg-white/5';
  const highlightTone = isLight ? 'text-amber-600' : 'text-amber-100';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedSide = watch('side', 'yes');
  const currentAmount = watch('amount', data.amount);

  const expectedPayout = useMemo(() => {
    const multiplier = selectedSide === 'yes' ? odds?.yes : odds?.no;
    if (!multiplier || Number.isNaN(currentAmount)) {
      return 0;
    }
    return Number((currentAmount * multiplier).toFixed(2));
  }, [currentAmount, odds?.no, odds?.yes, selectedSide]);

  const expectedProfit = useMemo(() => {
    if (!expectedPayout) {
      return 0;
    }
    return Number((expectedPayout - (Number.isNaN(currentAmount) ? 0 : currentAmount)).toFixed(2));
  }, [currentAmount, expectedPayout]);

  const handleSelectSide = useCallback(
    (next: 'yes' | 'no') => {
      setValue('side', next, { shouldDirty: true, shouldTouch: true });
    },
    [setValue],
  );

  const clampAmount = useCallback(
    (value: number) => {
      if (Number.isNaN(value)) {
        return value;
      }
      const min = data.minAmount ?? 1;
      const max = maxAmount ?? value;
      return Math.max(min, max ? Math.min(value, max) : value);
    },
    [data.minAmount, maxAmount],
  );

  const handleQuickFill = useCallback(
    (value: number) => {
      setValue('amount', clampAmount(value), { shouldDirty: true, shouldTouch: true });
    },
    [clampAmount, setValue],
  );

  const handleSuccess = useCallback(async (values: BetFormValues) => {
    setStatusMessage(null);
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await execute({
          marketId: data.marketId,
          amount: values.amount,
          side: values.side,
        });
      }
      setSuccess(true);
      reset({ ...defaultValues, amount: values.amount, side: values.side });
      setStatusMessage({ type: 'success', text: t('market:quickBet.successNotice') });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('detail:modal.genericError', { defaultValue: '提交失败，请稍后重试' });
      setStatusMessage({ type: 'error', text: message });
    }
  }, [data.marketId, defaultValues, execute, onSubmit, reset, t]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccess(false), 800);
    return () => window.clearTimeout(timer);
  }, [success]);

  const containerTone = isLight
    ? 'border-slate-200/70 from-white/98 via-amber-50/25 to-white/40 shadow-[0_32px_60px_-40px_rgba(203,213,225,0.65)] text-slate-800'
    : 'border-white/8 from-white/8 via-white/5 to-transparent shadow-[0_26px_42px_-38px_rgba(15,23,42,0.65)] text-white/80';
  const walletPanelTone = isLight
    ? 'border-slate-200 bg-white/90 text-slate-600'
    : 'border-white/10 bg-white/5 text-white/70';

  return (
    <form
      className={clsx(
        'rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl transition-colors duration-300',
        containerTone,
      )}
      onSubmit={handleSubmit(handleSuccess, () => setSuccess(false))}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-amber-200/70">
            {t('market:quickBet.title')}
          </p>
          <h2 className={`text-2xl font-semibold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {data.marketTitle}
          </h2>
          <p className={`text-sm ${textMuted}`}>{rangeText}</p>
        </div>
        {onClose ? (
          <GlassButtonGlass
            variant="ghost"
            type="button"
            aria-label={t('common:close')}
            className="self-end rounded-full !px-0 !py-0"
            onClick={onClose}
          >
            <Sparkles className="h-4 w-4" />
          </GlassButtonGlass>
        ) : null}
      </div>

      <div
        className={clsx(
          'mt-6 flex flex-col gap-3 rounded-2xl border px-4 py-3 text-xs transition-colors sm:flex-row sm:items-center sm:justify-between',
          walletPanelTone,
        )}
      >
        {wallet?.account?.address ? (
          <span className={isLight ? 'text-slate-600' : 'text-white/70'}>
            {t('market:quickBet.connectedWallet', { address: shorten(wallet.account.address) })}
          </span>
        ) : (
          <span className={isLight ? 'text-slate-600' : 'text-white/70'}>{t('market:quickBet.connectPrompt')}</span>
        )}
        {odds ? (
          <span className={clsx('font-mono', isLight ? 'text-slate-700' : 'text-white/80')}>
            {t('market:quickBet.currentOdds', { yes: odds.yes.toFixed(2), no: odds.no.toFixed(2) })}
          </span>
        ) : null}
      </div>

      <label className={`block text-sm ${textMuted}`}>
        <span className={`text-xs uppercase tracking-[0.25em] ${textMutedSecondary}`}>
          {t('detail:modal.amount')} ({data.currency})
        </span>
        <div
          className={clsx(
            'mt-2 rounded-2xl border px-5 py-4 backdrop-blur-xl shadow-inner transition-colors',
            errors.amount ? 'border-rose-400/40' : panelBorder,
            isLight ? 'bg-white/80' : panelBg,
          )}
        >
          <div className="relative flex items-center">
            <input
              type="number"
              step="0.01"
              className={`w-full bg-transparent font-mono text-2xl ${highlightTone} outline-none pr-16`}
              {...register('amount', {
                valueAsNumber: true,
                setValueAs: (value) => clampAmount(Number(value)),
              })}
            />
            {maxAmount ? (
              <button
                type="button"
                onClick={() => handleQuickFill(maxAmount)}
                className="absolute right-0 rounded-full bg-gradient-to-r from-amber-300/40 to-amber-500/50 px-4 py-1 text-xs font-semibold text-amber-900/80 transition hover:from-amber-400/50 hover:to-amber-500/60"
              >
                {t('market:quickBet.fillAll')}
              </button>
            ) : null}
          </div>
        </div>
        {errors.amount ? <span className="mt-1 block text-xs text-rose-300">{errors.amount.message}</span> : null}
      </label>

      <div className="flex flex-wrap gap-2 text-sm">
        {quickAmounts.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleQuickFill(value)}
            className={`rounded-full border px-3 py-1 font-medium transition hover:-translate-y-0.5 hover:shadow-lg ${
              isLight
                ? 'border-slate-900/10 bg-white/80 text-slate-600 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.7)] hover:border-slate-900/20 hover:text-slate-800'
                : 'border-white/10 bg-white/10 text-white/70 shadow-[0_10px_22px_-20px_rgba(15,23,42,0.9)] hover:border-white/25 hover:text-white'
            }`}
          >
            {numberFormatter.format(value)}
          </button>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <span className={`text-xs uppercase tracking-[0.25em] ${textMutedSecondary}`}>
          {t('market:quickBet.chooseSide', { defaultValue: '选择投注方向' })}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {(['yes', 'no'] as const).map((side) => {
            const isActive = selectedSide === side;
            return (
              <button
                key={side}
                type="button"
                onClick={() => handleSelectSide(side)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? side === 'yes'
                      ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(34,197,94,0.25)]'
                      : 'border-rose-400/60 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.25)]'
                    : isLight
                      ? 'border-slate-200/80 bg-white/60 text-slate-500 hover:border-slate-400/70 hover:text-slate-700'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {side === 'yes' ? t('market:yes') : t('market:no')}
              </button>
            );
          })}
      </div>
      <input type="hidden" value={selectedSide} {...register('side')} />
      {errors.side ? (
        <span className="mt-1 block text-xs text-rose-300">
          {errors.side.message ?? t('market:quickBet.sideRequired', { defaultValue: '请选择投注方向' })}
        </span>
      ) : null}
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} px-4 py-3 text-sm ${textMuted}`}>
        <p className={`text-xs uppercase tracking-[0.25em] ${textMutedSecondary}`}>
          {t('market:quickBet.expected.title')}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className={`text-[11px] uppercase tracking-[0.2em] ${textMutedSecondary}`}>
              {t('market:quickBet.expected.payout')}
            </p>
            <p className={`font-mono text-lg font-semibold ${highlightTone}`}>
              {Number.isNaN(expectedPayout) ? '--' : numberFormatter.format(expectedPayout)} {data.currency}
            </p>
          </div>
          <div>
            <p className={`text-[11px] uppercase tracking-[0.2em] ${textMutedSecondary}`}>
              {t('market:quickBet.expected.profit')}
            </p>
            <p className={`font-mono text-lg font-semibold ${expectedProfit >= 0 ? highlightTone : 'text-rose-300'}`}>
              {Number.isNaN(expectedProfit) ? '--' : numberFormatter.format(expectedProfit)} {data.currency}
            </p>
          </div>
          <div>
            <p className={`text-[11px] uppercase tracking-[0.2em] ${textMutedSecondary}`}>
              {t('market:quickBet.expected.odds')}
            </p>
            <p className={`font-mono text-lg font-semibold ${highlightTone}`}>
              {selectedSide === 'yes'
                ? (odds?.yes?.toFixed(2) ?? '--')
                : (odds?.no?.toFixed(2) ?? '--')}x
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {onClose ? (
          <GlassButtonGlass
            type="button"
            variant="secondary"
            disabled={isSubmitting || isPending}
            onClick={onClose}
          >
            {resolvedCancelLabel}
          </GlassButtonGlass>
        ) : null}
        <GlassButtonGlass
          type="submit"
          disabled={isSubmitting || isPending}
          className="min-w-[160px] rounded-full bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-900 shadow-[0_22px_38px_-30px_rgba(251,191,36,0.8)] hover:from-amber-300 hover:to-amber-500"
        >
          {isSubmitting || isPending ? t('market:quickBet.submitting', { defaultValue: '提交中…' }) : resolvedSubmitLabel}
        </GlassButtonGlass>
      </div>

      {statusMessage ? (
        <p
          className={`text-center text-xs ${
            statusMessage.type === 'success' ? 'text-emerald-200' : 'text-rose-300'
          }`}
        >
          {statusMessage.text}
        </p>
      ) : null}

      <Confetti active={success} delayMs={120} />
    </form>
  );
}
