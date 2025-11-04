import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { GlassModalGlass } from './GlassModalGlass';
import { GlassButtonGlass } from './GlassButtonGlass';
import { useI18n } from '@/hooks/useI18n';
import { useBetExecutor } from '@/hooks/useBetExecutor';

const AMOUNT_PRESETS = [50, 100, 250, 500, 1000, 2500];

type QuickBetModalProps = {
  open: boolean;
  marketId: string;
  marketTitle: string;
  side: 'yes' | 'no';
  odds: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function QuickBetModal({ open, marketId, marketTitle, side, odds, onClose, onSuccess }: QuickBetModalProps) {
  const { t } = useI18n(['home', 'market']);
  const { execute, isPending } = useBetExecutor();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(AMOUNT_PRESETS[1]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const filteredPresets = useMemo(() => AMOUNT_PRESETS.filter((value) => value > 0), []);
  const potential = useMemo(() => Number((amount * odds).toFixed(2)), [amount, odds]);

  const handleSelect = (value: number) => {
    setAmount(value);
    setStatus('idle');
    setMessage(null);
  };

  const handleConfirm = async () => {
    setStatus('idle');
    setMessage(null);
    try {
      await execute({ marketId, amount, side });
      setStatus('success');
      setMessage(t('home:card.betSuccess'));
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'home' });
      queryClient.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'market' });
      onSuccess?.();
      window.setTimeout(onClose, 1200);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : t('home:card.betFailed'));
    }
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <GlassModalGlass
      open
      onClose={() => {
        setStatus('idle');
        setMessage(null);
        onClose();
      }}
      title={t('home:card.quickBetTitle', { market: marketTitle })}
      description={t(`home:card.quickBetSubtitle.${side}` as const)}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {filteredPresets.map((preset) => {
            const active = preset === amount;
            return (
              <button
                key={`quick-bet-${preset}`}
                type="button"
                onClick={() => handleSelect(preset)}
                disabled={isPending}
                className={clsx(
                  'flex h-12 items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-150',
                  active
                    ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.45)]'
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-emerald-300/60 hover:text-white',
                )}
              >
                {preset} TAI
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>{t('home:card.quickBetOdds')}</span>
            <span className="font-mono text-base text-emerald-200">{odds.toFixed(2)}x</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>{t('home:card.quickBetPotential')}</span>
            <span className="font-mono text-base text-amber-200">{potential} TAI</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>{t('home:card.quickBetDirection', { side: side === 'yes' ? t('market:yes') : t('market:no') })}</span>
            <span className="font-mono text-base text-white">{amount} TAI</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>{t('home:card.quickBetPayout')}</span>
            <span className="font-mono text-sm text-emerald-200">{potential} TAI</span>
          </div>
        </div>

        {message ? (
          <div
            className={clsx(
              'rounded-2xl border px-3 py-2 text-sm',
              status === 'success'
                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                : 'border-rose-400/40 bg-rose-500/15 text-rose-100',
            )}
          >
            {status === 'success' ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : null}
            {message}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <GlassButtonGlass variant="ghost" onClick={onClose} disabled={isPending}>
            {t('common:close')}
          </GlassButtonGlass>
          <GlassButtonGlass
            onClick={handleConfirm}
            disabled={isPending}
            className="!rounded-full !px-6"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isPending
              ? t('home:card.betProcessing')
              : t('home:card.betConfirmWithPayout', { payout: potential, currency: 'TAI' })}
          </GlassButtonGlass>
        </div>
      </div>
    </GlassModalGlass>,
    document.body,
  );
}
