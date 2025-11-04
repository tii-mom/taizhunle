import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTonWallet } from '@tonconnect/ui-react';

import { useHaptic } from '../../hooks/useHaptic';
import { StepIndicator } from '../common/StepIndicator';
import { triggerSuccessConfetti } from '../../utils/confetti';
import { GlassCard } from '../glass/GlassCard';
import { createMarketDraft, loadCreationPermission } from '../../services/markets';

const schema = z.object({
  title: z.string().min(1, 'title'),
  closesAt: z.string().min(1, 'closesAt'),
  minStake: z.number().min(1, 'minStake'),
  maxStake: z.number().min(1, 'maxStake'),
  rewardTai: z.number().min(100, 'rewardTaiMin').max(10_000, 'rewardTaiMax'),
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
  const wallet = useTonWallet();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState,
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', closesAt: '', minStake: 10, maxStake: 1000, rewardTai: 100 },
    mode: 'onBlur',
  });
  const { errors, dirtyFields } = formState;

  const minStake = watch('minStake');
  const maxStake = watch('maxStake');
  const rewardTai = watch('rewardTai');
  const rewardDisplay = Number.isFinite(rewardTai) ? rewardTai : 0;
  const rangePreview = useMemo(
    () =>
      t('create:form.rangePreview', {
        min: Number.isFinite(minStake) ? minStake : 0,
        max: Number.isFinite(maxStake) ? maxStake : 0,
      }),
    [minStake, maxStake, t],
  );

  const walletAddress = wallet?.account?.address ?? '';
  const {
    data: permission,
    isFetching: isPermissionLoading,
    refetch: refetchPermission,
  } = useQuery({
    queryKey: ['market', 'creation-permission', walletAddress],
    queryFn: () => loadCreationPermission(walletAddress),
    enabled: Boolean(walletAddress),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (permission && !dirtyFields.rewardTai) {
      setValue('rewardTai', permission.defaultRewardTai);
    }
  }, [permission, dirtyFields.rewardTai, setValue]);

  const canCreate = permission?.canCreate ?? true;
  const cooldownMessage = useMemo(() => {
    if (!permission || permission.canCreate) {
      return null;
    }
    const waitHours = Math.max(1, Math.ceil(permission.hoursRemaining));
    const nextTime = permission.nextAvailableTime
      ? new Date(permission.nextAvailableTime).toLocaleString()
      : null;
    return t('create:form.cooldownMessage', {
      hours: waitHours,
      time: nextTime ?? '—',
    });
  }, [permission, t]);

  const steps = useMemo(
    () => [
      { key: 'step1', label: t('form:step1') },
      { key: 'step2', label: t('form:step2') },
      { key: 'step3', label: t('form:step3') },
    ],
    [t],
  );

  const createMutation = useMutation({
    mutationFn: createMarketDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      if (walletAddress) {
        void refetchPermission();
      }
    },
  });

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

  const onSubmit = async (values: FormValues) => {
    if (!wallet?.account?.address) {
      window.alert(t('create:form.connectWallet'));
      return;
    }

    if (permission && !permission.canCreate) {
      window.alert(
        t('create:form.cooldownBlocked', {
          hours: Math.max(1, Math.ceil(permission.hoursRemaining)),
          time: permission.nextAvailableTime
            ? new Date(permission.nextAvailableTime).toLocaleString()
            : '—',
        }),
      );
      return;
    }

    try {
      createMutation.reset();
      await createMutation.mutateAsync({
        title: values.title,
        closesAt: values.closesAt,
        minStake: values.minStake,
        maxStake: values.maxStake,
        creatorWallet: wallet.account.address,
        rewardTai: values.rewardTai,
      });

      triggerSuccessConfetti();
      window.alert(t('create:form.submitSuccess'));
      reset({
        title: '',
        closesAt: '',
        minStake: 10,
        maxStake: 1000,
        rewardTai: permission?.defaultRewardTai ?? 100,
      });
      setCurrentStep(0);
    } catch (error) {
      console.error('Create prediction failed:', error);
      const message = error instanceof Error ? error.message : t('create:form.submitError');
      window.alert(message);
    }
  };

  return (
    <GlassCard className="p-6">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {walletAddress ? (
          <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/70">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>
                {isPermissionLoading
                  ? t('create:form.permissionLoading')
                  : cooldownMessage ?? t('create:form.permissionReady', {
                      hours: permission?.intervalHours ?? 360,
                      points: permission?.points ?? 0,
                    })}
              </span>
              <button
                type="button"
                onClick={() => refetchPermission()}
                disabled={isPermissionLoading}
                className="glass-button-secondary !rounded-full !px-4 !py-1 text-xs disabled:opacity-50"
              >
                {t('create:form.refreshPermission')}
              </button>
            </div>
            {permission ? (
              <p className="mt-2 text-xs text-white/50">
                {t('create:form.permissionDetail', {
                  interval: permission.intervalHours,
                  min: permission.minRewardTai,
                  max: permission.maxRewardTai,
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {t('create:form.connectFirst')}
          </div>
        )}

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
            <label className="block text-sm">
              {t('create:fields.rewardTai')}
              <input
                type="number"
                className={`glass-input mt-2 ${errors.rewardTai ? 'animate-shake border-rose-400/40 focus:ring-rose-300/40' : ''}`}
                {...register('rewardTai', { valueAsNumber: true })}
              />
              {errors.rewardTai ? (
                <span className="mt-1 block text-xs text-rose-300">{t(`create:errors.${errors.rewardTai.message}`)}</span>
              ) : (
                <span className="mt-1 block text-xs text-white/50">
                  {t('create:form.rewardHint', {
                    min: permission?.minRewardTai ?? 100,
                    max: permission?.maxRewardTai ?? 10_000,
                  })}
                </span>
              )}
            </label>
            <div className="glass-card-sm p-4 text-sm text-white/70">
              {t('create:form.feeSummary', {
                reward: rewardDisplay,
                gas: '≈0.3 TON',
              })}
            </div>
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
            <button
              type="submit"
              onClick={() => vibrate()}
              disabled={createMutation.isPending || !canCreate}
              className="glass-button-primary !rounded-full !px-6 !py-2 text-xs disabled:opacity-50"
            >
              {createMutation.isPending ? t('form:submitting') : t('form:submit')}
            </button>
          )}
        </div>
        {!canCreate && cooldownMessage ? (
          <p className="text-xs text-rose-300">{cooldownMessage}</p>
        ) : null}
      </form>
    </GlassCard>
  );
}
