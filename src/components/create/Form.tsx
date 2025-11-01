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
import { GlassCard } from '../glass/GlassCard';

const schema = z.object({
  title: z.string().min(1, 'title'),
  closesAt: z.string().min(1, 'closesAt'),
  minStake: z.number().min(1, 'minStake'),
  maxStake: z.number().min(1, 'maxStake'),
}).superRefine((value, ctx) => {
  if (value.maxStake < value.minStake) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'maxStake', path: ['maxStake'] });
  }
});

type FormValues = z.infer<typeof schema>;

export function CreateForm() {
  const { t } = useTranslation(['create', 'form']);
  const { vibrate } = useHaptic();
  const [currentStep, setCurrentStep] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', closesAt: '', minStake: 10, maxStake: 1000 },
    mode: 'onBlur',
  });

  const minStake = watch('minStake');
  const maxStake = watch('maxStake');
  const rangePreview = useMemo(
    () =>
      t('create:form.rangePreview', {
        min: Number.isFinite(minStake) ? minStake : 0,
        max: Number.isFinite(maxStake) ? maxStake : 0,
      }),
    [minStake, maxStake, t],
  );

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
    <GlassCard className="p-6">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

        <AnimatePresence mode="wait">
        {currentStep === 0 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 text-white/80"
          >
            <p className="text-sm text-white/60">{t('create:form.hint')}</p>
            <label className="block text-sm">
              {t('create:fields.title')}
              <input
                className={`glass-input mt-2 ${errors.title ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
                {...register('title')}
              />
              {errors.title ? <span className="mt-1 block text-xs text-rose-300">{t(`create:errors.${errors.title.message}`)}</span> : null}
            </label>
          </motion.div>
        ) : null}

        {currentStep === 1 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 text-white/80"
          >
            <label className="block text-sm">
              {t('create:fields.closesAt')}
              <input
                type="datetime-local"
                className={`glass-input mt-2 ${errors.closesAt ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
                {...register('closesAt')}
              />
              {errors.closesAt ? (
                <span className="mt-1 block text-xs text-rose-300">{t(`create:errors.${errors.closesAt.message}`)}</span>
              ) : null}
            </label>
          </motion.div>
        ) : null}

        {currentStep === 2 ? (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 text-white/80"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                {t('create:fields.minStake')}
                <input
                  type="number"
                  className={`glass-input mt-2 ${errors.minStake ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
                  {...register('minStake', { valueAsNumber: true })}
                />
                {errors.minStake ? (
                  <span className="mt-1 block text-xs text-rose-300">{t(`create:errors.${errors.minStake.message}`)}</span>
                ) : null}
              </label>
              <label className="text-sm">
                {t('create:fields.maxStake')}
                <input
                  type="number"
                  className={`glass-input mt-2 ${errors.maxStake ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
                  {...register('maxStake', { valueAsNumber: true })}
                />
                {errors.maxStake ? (
                  <span className="mt-1 block text-xs text-rose-300">{t(`create:errors.${errors.maxStake.message}`)}</span>
                ) : null}
              </label>
            </div>
            <div className="glass-card-sm p-4 text-sm text-white/70">{rangePreview}</div>
          </motion.div>
        ) : null}
        </AnimatePresence>

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="glass-button-secondary !rounded-full !px-4 !py-2 text-xs disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            {t('form:prev')}
          </button>
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={handleNext} className="glass-button-primary !rounded-full !px-6 !py-2 text-xs">
              {t('form:next')}
              <ChevronRight size={14} />
            </button>
          ) : (
            <button type="submit" onClick={() => vibrate()} className="glass-button-primary !rounded-full !px-6 !py-2 text-xs">
              {t('form:submit')}
            </button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
