import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, X } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

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
  const { vibrate } = useHaptic();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { amount: 100, note: '' } });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-6">
      <form className="w-full max-w-md space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg" onSubmit={handleSubmit(async (values) => { await onSubmit(values); onClose(); })}>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <label className="block text-sm text-text-secondary">
          {amountLabel}
          <div className="relative mt-1">
            <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
            <input
              type="number"
              step="0.01"
              className={`w-full rounded-xl border py-2 pl-10 pr-3 font-mono transition-all duration-200 focus:ring-2 focus:ring-accent/40 ${errors.amount ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border bg-background'}`}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount ? <span className="text-xs text-danger">{amountError}</span> : null}
        </label>
        <label className="block text-sm text-text-secondary">
          {noteLabel}
          <textarea
            rows={2}
            className={`mt-1 w-full rounded-xl border px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-accent/40 ${errors.note ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border bg-background'}`}
            {...register('note')}
          />
          {errors.note ? <span className="text-xs text-danger">{noteError}</span> : null}
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
            disabled={isSubmitting}
          >
            <X size={16} className="text-text-secondary" />
            {cancelLabel}
          </button>
          <button
            type="submit"
            onClick={() => vibrate()}
            className="rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-2 text-sm font-semibold text-accent-contrast shadow-lg shadow-accent/30 transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-60 md:hover:shadow-lg"
            disabled={isSubmitting}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
