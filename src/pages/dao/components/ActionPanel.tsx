import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';

export type ActionPanelProps = {
  onStake: () => void;
  onClaim: () => void;
  onWithdraw: () => void;
  claimDisabled?: boolean;
  claimLoading?: boolean;
};

export function ActionPanel({ onStake, onClaim, onWithdraw, claimDisabled = false, claimLoading = false }: ActionPanelProps) {
  const { t } = useI18n('dao');

  return (
    <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-5">
      <div className="text-sm text-slate-300/70">
        <p>{t('actions.hint')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <GlassButtonGlass
          className="!rounded-xl !bg-gradient-to-r !from-cyan-400 !to-blue-500 !text-slate-900"
          onClick={onStake}
        >
          {t('actions.stakeMore')}
        </GlassButtonGlass>
        <GlassButtonGlass
          className="!rounded-xl !bg-gradient-to-r !from-emerald-400 !to-emerald-500 !text-slate-900"
          onClick={onClaim}
          disabled={claimDisabled || claimLoading}
        >
          {claimLoading ? t('modals.common.processing') : t('actions.claimAll')}
        </GlassButtonGlass>
        <GlassButtonGlass
          variant="ghost"
          className="!rounded-xl border border-white/15"
          onClick={onWithdraw}
        >
          {t('actions.exit')}
        </GlassButtonGlass>
      </div>
    </GlassCard>
  );
}
