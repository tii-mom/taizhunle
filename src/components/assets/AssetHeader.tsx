import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';

import { useCountUp } from '../../hooks/useCountUp';
import { useTAIPrice } from '../../hooks/useTAIPrice';
import { useAssetData } from '../../hooks/useAssetData';
import { formatNumber } from '../../utils/format';
import { useHaptic } from '../../hooks/useHaptic';
import { ChargeModalGlass } from '../glass/ChargeModalGlass';
import { WithdrawModalGlass } from '../glass/WithdrawModalGlass';
import { ExchangeModalGlass } from '../glass/ExchangeModalGlass';
import { GlassCard } from '../glass/GlassCard';
import { GoldenHammer } from '../glass/GoldenHammer';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../providers/ThemeProvider';

type TransactionType = 'charge' | 'withdraw' | 'exchange' | null;

export function AssetHeader() {
  const { t } = useI18n('assets');
  const { mode } = useTheme();
  const { vibrate } = useHaptic();
  const { balance, change24h, isLoading, refetch } = useAssetData();
  const { price: taiPrice, isLoading: isPriceLoading } = useTAIPrice();
  const [modalType, setModalType] = useState<TransactionType>(null);

  const animatedBalance = useCountUp(balance);
  const animatedPrice = useCountUp(taiPrice);
  const animatedChange = useCountUp(change24h);

  const isPositive = change24h >= 0;
  const hammerLevel = balance >= 50000 ? 'gold' : balance >= 20000 ? 'silver' : balance >= 5000 ? 'bronze' : 'gray';
  const labelTone = mode === 'light' ? 'text-slate-600' : 'text-white/60';

  const handleRefresh = () => {
    vibrate();
    refetch();
  };

  const handleTransaction = (type: 'charge' | 'withdraw' | 'exchange') => {
    vibrate();
    setModalType(type);
  };

  const handleTransactionSubmit = async (values: unknown) => {
    console.log('Transaction:', modalType, values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <GlassCard className="space-y-5 overflow-hidden p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className={`text-sm ${labelTone}`}>{t('balance')}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,0.45)]">
              {formatNumber(animatedBalance, 2)}
            </span>
            <span className="text-xl text-white/60">TAI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-tile flex items-center gap-2 px-4 py-2">
            <GoldenHammer count={Math.max(1, Math.round(balance / 5000))} level={hammerLevel} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">jury tier</p>
              <p className="text-sm font-semibold text-amber-100">Lv.{Math.max(1, Math.floor(balance / 8000))}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="glass-button-secondary h-10 w-10 !rounded-full !p-0"
            title={t('refresh')}
          >
            <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : ''} text-amber-200`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card-sm p-4">
          <p className={`mb-2 text-xs ${labelTone}`}>{t('usdt')}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-semibold text-white">
              {isPriceLoading ? '...' : formatNumber(animatedPrice, 4)}
            </span>
            <span className="text-xs text-white/60">USDT</span>
          </div>
        </div>
        <div className="glass-card-sm p-4">
          <p className={`mb-2 text-xs ${labelTone}`}>{t('change')}</p>
          <div className="flex items-center gap-2">
            {isPositive ? <ArrowUpRight size={16} className="text-emerald-300" /> : <ArrowDownRight size={16} className="text-rose-400" />}
            <span className={`font-mono text-lg font-semibold ${isPositive ? 'text-emerald-300' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}
              {formatNumber(animatedChange, 2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleTransaction('charge')}
          className="glass-button-secondary flex flex-col items-center gap-2 text-sm font-semibold"
        >
          {t('deposit')}
        </button>
        <button
          type="button"
          onClick={() => handleTransaction('withdraw')}
          className="glass-button-secondary flex flex-col items-center gap-2 text-sm font-semibold"
        >
          {t('withdraw')}
        </button>
        <button
          type="button"
          onClick={() => handleTransaction('exchange')}
          className="glass-button-secondary flex flex-col items-center gap-2 text-sm font-semibold"
        >
          {t('exchange')}
        </button>
      </div>

      {modalType === 'charge' ? (
        <ChargeModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
      {modalType === 'withdraw' ? (
        <WithdrawModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
      {modalType === 'exchange' ? (
        <ExchangeModalGlass open balance={balance} onClose={() => setModalType(null)} onSubmit={handleTransactionSubmit} />
      ) : null}
    </GlassCard>
  );
}
