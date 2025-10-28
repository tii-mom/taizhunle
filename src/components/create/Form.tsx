import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';
import { StepIndicator } from '../common/StepIndicator';
import { triggerSuccessConfetti } from '../../utils/confetti';

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
  const { t } = useTranslation(['create', 'form']);
  const { vibrate } = useHaptic();
  const [currentStep, setCurrentStep] = useState(0);
  const { register, handleSubmit, reset, formState: { errors }, watch, trigger } = useForm<FormValues>({ 
    resolver: zodResolver(schema), 
    defaultValues: { title: '', closesAt: '', minStake: 10, maxStake: 1000 },
    mode: 'onBlur'
  });
  const minStake = watch('minStake');
  const maxStake = watch('maxStake');
  const rangePreview = useMemo(() => t('create:form.rangePreview', { min: Number.isFinite(minStake) ? minStake : 0, max: Number.isFinite(maxStake) ? maxStake : 0 }), [minStake, maxStake, t]);

  const steps = useMemo(
    () => [
      { key: 'step1', label: t('form:step1') },
      { key: 'step2', label: t('form:step2') },
      { key: 'step3', label: t('form:step3') },
    ],
    [t],
  );

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await trigger('title');
    } else if (currentStep === 1) {
      isValid = await trigger('closesAt');
    }
    
    if (isValid) {
      vibrate();
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    vibrate();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const onSubmit = (values: FormValues) => {
    triggerSuccessConfetti();
    window.alert(t('create:form.submitSuccess'));
    reset(values);
    setCurrentStep(0);
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md"
      onSubmit={handleSubmit(onSubmit)}
    >
      <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <p className="text-sm text-text-secondary">{t('create:form.hint')}</p>
            <label className="block text-sm font-medium text-text-secondary">
              {t('create:fields.title')}
              <input
                className={`mt-2 w-full rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 hover:ring-2 hover:ring-accent/30 ${errors.title ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
                {...register('title')}
              />
              {errors.title ? <span className="mt-1 block text-xs text-danger">{t(`create:errors.${errors.title.message}`)}</span> : null}
            </label>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-text-secondary">
              {t('create:fields.closesAt')}
              <input
                type="datetime-local"
                className={`mt-2 w-full rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 hover:ring-2 hover:ring-accent/30 ${errors.closesAt ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
                {...register('closesAt')}
              />
              {errors.closesAt ? <span className="mt-1 block text-xs text-danger">{t(`create:errors.${errors.closesAt.message}`)}</span> : null}
            </label>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-text-secondary">
                {t('create:fields.minStake')}
                <input
                  type="number"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 hover:ring-2 hover:ring-accent/30 ${errors.minStake ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
                  {...register('minStake', { valueAsNumber: true })}
                />
                {errors.minStake ? <span className="mt-1 block text-xs text-danger">{t(`create:errors.${errors.minStake.message}`)}</span> : null}
              </label>
              <label className="text-sm font-medium text-text-secondary">
                {t('create:fields.maxStake')}
                <input
                  type="number"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 backdrop-blur-md transition-all duration-200 focus:ring-2 focus:ring-accent/50 hover:ring-2 hover:ring-accent/30 ${errors.maxStake ? 'animate-shake border-danger ring-2 ring-danger/40' : 'border-border-light bg-surface-glass/60'}`}
                  {...register('maxStake', { valueAsNumber: true })}
                />
                {errors.maxStake ? <span className="mt-1 block text-xs text-danger">{t(`create:errors.${errors.maxStake.message}`)}</span> : null}
              </label>
            </div>
            <div className="rounded-xl border border-border-light bg-surface-glass/60 p-3 backdrop-blur-md">
              <p className="text-sm font-medium text-text-primary">{rangePreview}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm text-text-secondary transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 disabled:opacity-40 md:hover:shadow-lg"
        >
          <ChevronLeft size={16} />
          {t('form:prev')}
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
          >
            {t('form:next')}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            onClick={() => vibrate()}
            className="rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg"
          >
            {t('form:submit')}
          </button>
        )}
      </div>
    </form>
  );
}
