import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { amount: 100, note: '' } });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-6">
      <form className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface" onSubmit={handleSubmit(async (values) => { await onSubmit(values); onClose(); })}>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <label className="block text-sm text-text-secondary">
          {amountLabel}
          <input type="number" step="0.01" className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <span className="text-xs text-danger">{amountError}</span> : null}
        </label>
        <label className="block text-sm text-text-secondary">
          {noteLabel}
          <textarea rows={2} className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2" {...register('note')} />
          {errors.note ? <span className="text-xs text-danger">{noteError}</span> : null}
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary" disabled={isSubmitting}>{cancelLabel}</button>
          <button type="submit" className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-contrast disabled:opacity-50" disabled={isSubmitting}>{confirmLabel}</button>
        </div>
      </form>
    </div>
  );
}
