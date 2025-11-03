import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';
import type { TFunction } from 'i18next';

import { GlassButtonGlass } from './GlassButtonGlass';
import { Confetti } from './Confetti';
import type { BetModalData } from '@/queries/bet';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';
import { useBetExecutor } from '@/hooks/useBetExecutor';

const createBetSchema = (t: TFunction) =>
  z.object({
    amount: z
      .number({ invalid_type_error: t('detail:modal.amountError') })
      .min(1, t('detail:modal.amountError')),
    note: z.string().max(80, t('detail:modal.noteError')).optional(),
    side: z.enum(['yes', 'no'], {
      invalid_type_error: t('market:quickBet.sideRequired', { defaultValue: '请选择投注方向' }),
      required_error: t('market:quickBet.sideRequired', { defaultValue: '请选择投注方向' }),
    }),
    autoClaim: z.boolean().optional(),
  });

type BetFormValues = z.infer<ReturnType<typeof createBetSchema>>;

type BetModalGlassProps = {
  data: BetModalData;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (values: BetFormValues) => Promise<void> | void;
  onClose?: () => void;
};

export function BetModalGlass({ data, submitLabel, cancelLabel, onSubmit, onClose }: BetModalGlassProps) {
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t, locale } = useI18n(['market', 'detail', 'dao', 'common']);
  const { mode } = useTheme();
  const schema = useMemo(() => createBetSchema(t), [t]);
  const { execute, isPending } = useBetExecutor();

  const defaultValues = useMemo(
    () => ({ amount: data.amount, note: '', side: 'yes', autoClaim: true }) satisfies BetFormValues,
    [data.amount],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }),
    [locale],
  );

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
  const switchThumb = isLight ? 'bg-amber-500' : 'bg-amber-200';

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

  const handleSelectSide = useCallback(
    (next: 'yes' | 'no') => {
      setValue('side', next, { shouldDirty: true, shouldTouch: true });
    },
    [setValue],
  );

  const handleSuccess = useCallback(async (values: BetFormValues) => {
    setSubmitError(null);
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await execute({
          marketId: data.marketId,
          amount: values.amount,
          side: values.side,
          note: values.note,
        });
      }
      setSuccess(true);
      reset({ ...defaultValues, amount: values.amount, side: values.side });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('detail:modal.genericError', { defaultValue: '提交失败，请稍后重试' });
      setSubmitError(message);
      throw error;
    }
  }, [data.marketId, defaultValues, execute, onSubmit, reset, t]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccess(false), 800);
    return () => window.clearTimeout(timer);
  }, [success]);

  return (
    <form
      className="glass-card space-y-6 p-6"
      onSubmit={handleSubmit(handleSuccess, () => setSuccess(false))}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">{t('market:quickBet.title')}</p>
          <h2 className={`mt-2 text-xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.marketTitle}</h2>
          <p className={`mt-1 text-sm ${textMuted}`}>{rangeText}</p>
        </div>
        {onClose ? (
          <GlassButtonGlass
            variant="ghost"
            type="button"
            aria-label={t('common:close')}
            className="h-10 w-10 rounded-full !px-0 !py-0"
            onClick={onClose}
          >
            <Sparkles className="h-4 w-4" />
          </GlassButtonGlass>
        ) : null}
      </div>

      <label className={`block text-sm ${textMuted}`}>
        <span className={`text-xs uppercase tracking-[0.25em] ${textMutedSecondary}`}>
          {t('detail:modal.amount')} ({data.currency})
        </span>
        <div
          className={`mt-2 rounded-2xl border ${errors.amount ? 'border-rose-400/40' : panelBorder} ${panelBg} px-4 py-3 backdrop-blur-xl`}
        >
          <input
            type="number"
            step="0.01"
            className={`w-full bg-transparent font-mono text-2xl ${highlightTone} outline-none`}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount ? <span className="mt-1 block text-xs text-rose-300">{errors.amount.message}</span> : null}
      </label>

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

      <label className={`block text-sm ${textMuted}`}>
        <span className={`text-xs uppercase tracking-[0.25em] ${textMutedSecondary}`}>{t('detail:modal.note')}</span>
        <textarea
          rows={2}
          className={`glass-textarea mt-2 ${
            errors.note ? 'border-rose-400/40' : isLight ? 'border-slate-900/10 bg-white/80 text-slate-800' : ''
          }`}
          placeholder={t('market:quickBet.placeholder')}
          {...register('note')}
        />
        {errors.note ? <span className="mt-1 block text-xs text-rose-300">{errors.note.message}</span> : null}
      </label>

      <label className={`flex items-center gap-3 text-sm ${textMuted}`}>
        <input
          type="checkbox"
          className="peer sr-only"
          {...register('autoClaim')}
        />
        <span
          className={`inline-flex h-4 w-7 cursor-pointer items-center rounded-full border ${panelBorder} ${panelBg} p-0.5 transition-colors peer-checked:bg-amber-300/40`}
        >
          <span className={`inline-block h-3 w-3 rounded-full ${switchThumb} transition-all peer-checked:translate-x-3.5`} />
        </span>
        {t('dao:autoClaim')}
      </label>

      <div className="glass-modal-footer !px-0">
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
        <GlassButtonGlass type="submit" disabled={isSubmitting || isPending}>
          {resolvedSubmitLabel}
        </GlassButtonGlass>
      </div>

      {submitError ? (
        <p className="text-center text-xs text-rose-300">{submitError}</p>
      ) : null}

      <Confetti active={success} delayMs={120} />
    </form>
  );
}
