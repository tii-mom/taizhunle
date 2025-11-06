import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTonWallet } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';

import { useHaptic } from '../../hooks/useHaptic';
import { StepIndicator } from '../common/StepIndicator';
import { triggerSuccessConfetti } from '../../utils/confetti';
import { GlassCard } from '../glass/GlassCard';
import { createMarketDraft, loadCreationPermission } from '../../services/markets';
import { HotTopicSlider } from './HotTopicSlider';
import { GlassModalGlass } from '../glass/GlassModalGlass';
import { GlassButtonGlass } from '../glass/GlassButtonGlass';
import { MARKET_TAG_WHITELIST } from '../../constants/marketTags';

const MAX_REFERENCE_URL_LENGTH = 500;
const MAX_TAGS = 5;

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
  const wallet = useTonWallet();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState,
    watch,
    trigger,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', closesAt: '', minStake: 10, maxStake: 1000 },
    mode: 'onBlur',
  });
  const { errors } = formState;

  const minStake = watch('minStake');
  const maxStake = watch('maxStake');
  const titleValue = watch('title');
  const [referenceSummary, setReferenceSummary] = useState<string | null>(null);
  const [referenceLink, setReferenceLink] = useState<string | null>(null);
  const [appliedTagsState, setAppliedTagsState] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!titleValue?.trim()) {
      setReferenceSummary(null);
      setReferenceLink(null);
      setAppliedTagsState([]);
    }
  }, [titleValue]);

  const rangePreview = useMemo(
    () =>
      t('create:form.rangePreview', {
        min: Number.isFinite(minStake) ? minStake : 0,
        max: Number.isFinite(maxStake) ? maxStake : 0,
      }),
    [minStake, maxStake, t],
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const allowedTags = useMemo(() => new Set(MARKET_TAG_WHITELIST), []);

  const applyTags = useCallback((tags: string[]) => {
    const unique: string[] = [];
    for (const tag of tags) {
      const lower = tag.toLowerCase();
      if (!allowedTags.has(lower) || unique.includes(lower)) {
        continue;
      }
      unique.push(lower);
      if (unique.length >= MAX_TAGS) {
        break;
      }
    }
    setAppliedTagsState(unique);
  }, [allowedTags]);

  const toggleTag = useCallback((tag: string) => {
    setAppliedTagsState((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((entry) => entry !== tag);
      }
      if (prev.length >= MAX_TAGS) {
        return prev;
      }
      return [...prev, tag];
    });
  }, []);

  const appliedTags = useMemo(() => appliedTagsState.filter((tag) => allowedTags.has(tag)), [appliedTagsState, allowedTags]);

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

  const canCreate = permission?.canCreate ?? true;
  const stakeRequirement = permission?.requiredStakeTai ?? 1_000;
  const stakeCooldownHours = permission?.stakeCooldownHours ?? permission?.intervalHours ?? 360;
  const maxStakeTai = permission?.maxStakeTai ?? Math.max(stakeRequirement, 20_000);
  const [selectedStake, setSelectedStake] = useState<number>(stakeRequirement);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  useEffect(() => {
    setSelectedStake((prev) => {
      const next = Number.isFinite(prev) ? prev : stakeRequirement;
      if (next < stakeRequirement || next > maxStakeTai) {
        return stakeRequirement;
      }
      return next;
    });
  }, [stakeRequirement, maxStakeTai]);

  const stakeOptions = useMemo(() => {
    const options = new Set<number>();
    options.add(stakeRequirement);
    const midStake = Math.min(
      maxStakeTai,
      Math.max(stakeRequirement, Math.round((stakeRequirement + maxStakeTai) / 2 / 100) * 100),
    );
    options.add(midStake);
    options.add(maxStakeTai);
    return Array.from(options).sort((a, b) => a - b);
  }, [stakeRequirement, maxStakeTai]);
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

  const handlePublishDraft = async (values: FormValues) => {
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

    setPendingValues(values);
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!pendingValues || !wallet?.account?.address) {
      return;
    }

    try {
      createMutation.reset();
      const draft = await createMutation.mutateAsync({
        title: pendingValues.title,
        closesAt: pendingValues.closesAt,
        minStake: pendingValues.minStake,
        maxStake: pendingValues.maxStake,
        creatorWallet: wallet.account.address,
        creatorStakeTai: selectedStake,
        tags: appliedTags.length > 0 ? appliedTags : undefined,
        topicTags: appliedTags.length > 0 ? appliedTags : undefined,
        referenceUrl: referenceLink ?? undefined,
        referenceSummary: referenceSummary ?? undefined,
      });

      triggerSuccessConfetti();
      setShowConfirmModal(false);
      setPendingValues(null);
      window.alert(t('create:form.submitSuccess'));
      reset({
        title: '',
        closesAt: '',
        minStake: 10,
        maxStake: 1000,
      });
      setReferenceSummary(null);
      setReferenceLink(null);
      setAppliedTagsState([]);
      setSelectedStake(stakeRequirement);
      setCurrentStep(0);
      void refetchPermission();
      navigate(`/market/${draft.id}`);
    } catch (error) {
      console.error('Create prediction failed:', error);
      const message = error instanceof Error ? error.message : t('create:form.submitError');
      window.alert(message);
    }
  };

  const handleCancelConfirm = () => {
    if (createMutation.isPending) {
      return;
    }
    setShowConfirmModal(false);
  };

  return (
    <GlassCard className="p-6">
      <form className="space-y-6" onSubmit={handleSubmit(handlePublishDraft)}>
        {walletAddress ? (
          <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/70">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>
                {isPermissionLoading
                  ? t('create:form.permissionLoading')
                  : cooldownMessage ?? t('create:form.permissionReady', {
                      hours: permission?.intervalHours ?? 360,
                      stake: numberFormatter.format(stakeRequirement),
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
              <p className="mt-2 text-xs text-white/60">
                {t('create:form.stakeSummary', {
                  stake: numberFormatter.format(stakeRequirement),
                })}
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/60">{t('create:form.stakeSummaryHint')}</p>
            )}
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

            <HotTopicSlider
              currentTitle={titleValue ?? ''}
              onApplyTemplate={(topic) => {
                setValue('title', topic.template.title, { shouldDirty: true, shouldValidate: true });
                setReferenceSummary(topic.template.summary);
                setReferenceLink(topic.template.referenceUrl);
                applyTags(topic.tags);
                void trigger('title');
              }}
              onTagChange={(tag) => {
                if (tag === 'trending') {
                  applyTags([]);
                } else if (allowedTags.has(tag)) {
                  applyTags([tag]);
                }
              }}
              initialTag={appliedTags[0]}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                {t('create:fields.referenceLink')}
                <input
                  className="glass-input mt-2"
                  placeholder="https://"
                  value={referenceLink ?? ''}
                  onChange={(event) => {
                    const nextValue = event.target.value.trim();
                    if (!nextValue) {
                      setReferenceLink(null);
                      return;
                    }
                    setReferenceLink(nextValue.slice(0, MAX_REFERENCE_URL_LENGTH));
                  }}
                />
                <span className="mt-1 block text-xs text-white/50">
                  {t('create:form.referenceLinkHint', { max: MAX_REFERENCE_URL_LENGTH })}
                </span>
              </label>
              <div>
                <p className="text-sm font-semibold text-white">{t('create:fields.tags')}</p>
                <p className="mt-1 text-xs text-white/50">{t('create:form.tagsHint', { count: MAX_TAGS })}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MARKET_TAG_WHITELIST.map((tag) => {
                    const isActive = appliedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                          isActive
                            ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100'
                            : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        #{t(`create:tags.${tag}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {(referenceSummary || referenceLink || appliedTags.length > 0) ? (
              <div className="space-y-3 rounded-3xl border border-white/12 bg-white/6 p-4 text-xs text-white/80">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {t('create:referencePreview.title')}
                </div>
                {referenceSummary ? (
                  <div>
                    <p className="uppercase tracking-[0.25em] text-white/50">
                      {t('create:referencePreview.summary')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{referenceSummary}</p>
                  </div>
                ) : null}
                {referenceLink ? (
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-[0.25em] text-white/50">
                      {t('create:referencePreview.link')}
                    </span>
                    <a
                      href={referenceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-emerald-200 hover:text-emerald-100"
                    >
                      {referenceLink}
                    </a>
                  </div>
                ) : null}
                {appliedTags.length > 0 ? (
                  <div>
                    <p className="uppercase tracking-[0.25em] text-white/50">
                      {t('create:referencePreview.tags')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {appliedTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-white/70">
                          #{t(`create:tags.${tag}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
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

            <div className="space-y-3 rounded-3xl border border-white/12 bg-white/6 p-4 text-sm text-white/80">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white">{t('create:form.stakeOptionsTitle')}</p>
                <p className="text-xs text-white/60">{t('create:form.stakeOptionsHint')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stakeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedStake(option)}
                    className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                      selectedStake === option
                        ? 'border-emerald-300/60 bg-emerald-300/20 text-emerald-100'
                        : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {numberFormatter.format(option)} TAI
                  </button>
                ))}
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {t('create:form.stakeOptionsCustom')}
                  <input
                    type="number"
                    min={stakeRequirement}
                    max={maxStakeTai}
                    step={100}
                    value={selectedStake}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value)) {
                        const clamped = Math.min(Math.max(Math.round(value), stakeRequirement), maxStakeTai);
                        setSelectedStake(clamped);
                      }
                    }}
                    onBlur={(event) => {
                      const value = Number(event.target.value);
                      if (!Number.isFinite(value)) {
                        setSelectedStake(stakeRequirement);
                        return;
                      }
                      const clamped = Math.min(Math.max(Math.round(value), stakeRequirement), maxStakeTai);
                      setSelectedStake(clamped);
                    }}
                    className="glass-input mt-2"
                  />
                </label>
                <p className="text-xs text-white/60 text-right md:text-left">
                  {t('create:form.stakeOptionsInputHint', {
                    min: numberFormatter.format(stakeRequirement),
                    max: numberFormatter.format(maxStakeTai),
                  })}
                </p>
              </div>
            </div>

            <div className="glass-card-sm flex flex-col gap-2 p-4 text-sm text-white/80">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('create:form.stakeCardTitle')}</p>
                <p>{t('create:form.stakeCardSubtitle')}</p>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-mono text-xl text-amber-200">
                  {t('create:form.stakeCardAmount', { stake: numberFormatter.format(selectedStake) })}
                </span>
                <span className="text-xs uppercase tracking-[0.35em] text-white/60">
                  {t('create:form.stakeCardCooldown', { cooldown: stakeCooldownHours })}
                </span>
              </div>
              <p className="text-xs text-white/60">
                {t('create:form.stakeSummarySelected', {
                  stake: numberFormatter.format(selectedStake),
                  min: numberFormatter.format(stakeRequirement),
                })}
              </p>
              <p className="text-xs text-white/50">{t('create:form.stakeSummaryHint')}</p>
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
      <GlassModalGlass
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        title={t('create:confirm.title')}
        description={t('create:confirm.description')}
        footer={(
          <div className="flex justify-end gap-3">
            <GlassButtonGlass variant="ghost" onClick={handleCancelConfirm} disabled={createMutation.isPending}>
              {t('create:confirm.cancel')}
            </GlassButtonGlass>
            <GlassButtonGlass onClick={handleConfirmPublish} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('form:submitting') : t('create:confirm.publish')}
            </GlassButtonGlass>
          </div>
        )}
      >
        <div className="space-y-3 text-sm text-white/80">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:confirm.marketTitle')}</p>
            <p className="mt-1 text-white">{pendingValues?.title ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:confirm.closeTime')}</p>
            <p className="mt-1 text-white/80">
              {pendingValues?.closesAt ? new Date(pendingValues.closesAt).toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:confirm.stake')}</p>
            <p className="mt-1 text-white">
              {numberFormatter.format(selectedStake)} TAI
            </p>
          </div>
          {referenceSummary ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:confirm.referenceSummary')}</p>
              <p className="mt-1 text-white/80 leading-relaxed">{referenceSummary}</p>
            </div>
          ) : null}
          {referenceLink ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:confirm.referenceLink')}</p>
              <a
                href={referenceLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-emerald-200 hover:text-emerald-100"
              >
                {referenceLink}
              </a>
            </div>
          ) : null}
          {appliedTags.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t('create:referencePreview.tags')}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {appliedTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 px-3 py-1 text-white/70">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </GlassModalGlass>
    </GlassCard>
  );
}
