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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-6 backdrop-blur-sm">
      <form 
        className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md duration-200" 
        onSubmit={handleSubmit(async (values) => { await onSubmit(values); onClose(); })}
      >
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <label className="block text-sm text-text-secondary">
          {amountLabel}
          <div className="relative mt-2">
            <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
            <input
              type="number"
              step="0.01"
              className={`w-full rounded-xl border py-3 pl-10 pr-3 font-mono backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 ${errors.amount ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount ? <span className="mt-1 block text-xs text-danger">{amountError}</span> : null}
        </label>
        <label className="block text-sm text-text-secondary">
          {noteLabel}
          <textarea
            rows={2}
            className={`mt-2 w-full rounded-xl border px-3 py-2 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 ${errors.note ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
            {...register('note')}
          />
          {errors.note ? <span className="mt-1 block text-xs text-danger">{noteError}</span> : null}
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              vibrate();
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 text-sm text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
            disabled={isSubmitting}
          >
            <X size={16} className="text-text-secondary" />
            {cancelLabel}
          </button>
          <button
            type="submit"
            onClick={() => vibrate()}
            className="rounded-xl border border-border-light bg-gradient-to-r from-accent to-accent-light px-6 py-2 text-sm font-semibold text-accent-contrast shadow-lg transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
