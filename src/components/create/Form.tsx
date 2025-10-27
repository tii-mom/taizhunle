import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z
  .object({
    title: z.string().min(1, 'title'),
    closesAt: z.string().min(1, 'closesAt'),
    minStake: z.number().min(1, 'minStake'),
    maxStake: z.number().min(1, 'maxStake'),
  })
  .superRefine((value, ctx) => {
    if (value.maxStake < value.minStake) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'maxStake', path: ['maxStake'] });
    }
  });

type FormValues = z.infer<typeof schema>;

export function CreateForm() {
  const { t } = useTranslation('create');
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { title: '', closesAt: '', minStake: 10, maxStake: 1000 } });
  const minStake = watch('minStake');
  const maxStake = watch('maxStake');
  const rangePreview = useMemo(() => t('form.rangePreview', { min: Number.isFinite(minStake) ? minStake : 0, max: Number.isFinite(maxStake) ? maxStake : 0 }), [minStake, maxStake, t]);

  return (
    <form
      className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface"
      onSubmit={handleSubmit((values) => {
        window.alert(t('form.submitSuccess'));
        reset(values);
      })}
    >
      <p className="text-sm text-text-secondary">{t('form.hint')}</p>
      <label className="block text-sm text-text-secondary">
        {t('fields.title')}
        <input className="mt-1 w-full rounded border border-border bg-background px-3 py-2" {...register('title')} />
        {errors.title ? <span className="text-xs text-danger">{t(`errors.${errors.title.message}`)}</span> : null}
      </label>
      <label className="block text-sm text-text-secondary">
        {t('fields.closesAt')}
        <input type="datetime-local" className="mt-1 w-full rounded border border-border bg-background px-3 py-2" {...register('closesAt')} />
        {errors.closesAt ? <span className="text-xs text-danger">{t(`errors.${errors.closesAt.message}`)}</span> : null}
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-text-secondary">
          {t('fields.minStake')}
          <input type="number" className="mt-1 w-full rounded border border-border bg-background px-3 py-2" {...register('minStake', { valueAsNumber: true })} />
          {errors.minStake ? <span className="text-xs text-danger">{t(`errors.${errors.minStake.message}`)}</span> : null}
        </label>
        <label className="text-sm text-text-secondary">
          {t('fields.maxStake')}
          <input type="number" className="mt-1 w-full rounded border border-border bg-background px-3 py-2" {...register('maxStake', { valueAsNumber: true })} />
          {errors.maxStake ? <span className="text-xs text-danger">{t(`errors.${errors.maxStake.message}`)}</span> : null}
        </label>
      </div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">{rangePreview}</p>
      <div className="flex gap-3">
        <button type="submit" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">{t('buttons.submit')}</button>
        <button type="button" className="rounded-full border border-border px-4 py-3 text-sm text-text-secondary" onClick={() => window.alert(t('buttons.cancelled'))}>{t('buttons.cancel')}</button>
      </div>
    </form>
  );
}
