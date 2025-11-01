import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, X } from 'lucide-react';

import { useHaptic } from '../hooks/useHaptic';
import { useI18n } from '../hooks/useI18n';
import { useTheme } from '../providers/ThemeProvider';

const schema = z.object({ amount: z.number().min(1), note: z.string().max(80).optional() });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  amountLabel: string;
  amountError: string;
  noteLabel: string;
  noteError: string;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

export function BetModal({ open, title, confirmLabel, cancelLabel, amountLabel, amountError, noteLabel, noteError, onClose, onSubmit }: Props) {
  const { locale } = useI18n();
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { amount: 100, note: '' } });
  if (!open) return null;
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-lg',
        mode === 'light' ? 'bg-slate-900/50' : 'bg-slate-950/80',
      )}
    >
      <form
        className="glass-modal animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-4 duration-200"
        lang={locale}
        onSubmit={handleSubmit(async (values) => { await onSubmit(values); onClose(); })}
      >
        <div className="glass-modal-header">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className="glass-button-ghost h-10 w-10 !rounded-full !px-0 !py-0 text-white/60 hover:text-white"
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>

        <label className="block text-sm text-white/70">
          {amountLabel}
          <div className="relative mt-2">
            <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
            <input
              type="number"
              step="0.01"
              className={`glass-input mt-0 pl-10 pr-3 font-mono ${errors.amount ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount ? <span className="mt-1 block text-xs text-rose-300">{amountError}</span> : null}
        </label>
        <label className="block text-sm text-white/70">
          {noteLabel}
          <textarea
            rows={2}
            className={`glass-textarea mt-2 ${errors.note ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
            {...register('note')}
          />
          {errors.note ? <span className="mt-1 block text-xs text-rose-300">{noteError}</span> : null}
        </label>
        <div className="glass-modal-footer justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className="glass-button-secondary !rounded-full !px-4 !py-2 text-xs"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            onClick={() => vibrate()}
            className="glass-button-primary !rounded-full !px-6 !py-2 text-xs"
            disabled={isSubmitting}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
