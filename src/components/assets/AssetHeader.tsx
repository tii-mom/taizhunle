import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useTAIPrice } from '../../hooks/useTAIPrice';
import { useAssetData } from '../../hooks/useAssetData';
import { formatNumber } from '../../utils/format';
import { useHaptic } from '../../hooks/useHaptic';
import { TransactionModal } from './TransactionModal';

type TransactionType = 'deposit' | 'withdraw' | 'exchange' | null;

export function AssetHeader() {
  const { t } = useTranslation('assets');
  const { vibrate } = useHaptic();
  const { balance, change24h, isLoading, refetch } = useAssetData();
  const { price: taiPrice, isLoading: isPriceLoading } = useTAIPrice();
  const [modalType, setModalType] = useState<TransactionType>(null);

  const animatedBalance = useCountUp(balance);
  const animatedPrice = useCountUp(taiPrice);
  const animatedChange = useCountUp(change24h);

  const isPositive = change24h >= 0;

  const handleRefresh = () => {
    vibrate();
    refetch();
  };

  const handleTransaction = (type: 'deposit' | 'withdraw' | 'exchange') => {
    vibrate();
    setModalType(type);
  };

  const handleTransactionSubmit = async (values: any) => {
    // 实际项目中应该调用 API
    console.log('Transaction:', modalType, values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text-secondary">{t('balance')}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-accent shadow-accent/50 dark:shadow-accent/30">
              {formatNumber(animatedBalance, 2)}
            </span>
            <span className="text-xl text-text-secondary">TAI</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-lg p-2 transition-all hover:bg-surface-hover active:scale-95 disabled:opacity-50"
          title={t('refresh')}
        >
          <RefreshCw size={20} className={`text-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
          <p className="mb-2 text-xs text-text-secondary">{t('usdt')}</p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-text-primary">
              {isPriceLoading ? '...' : formatNumber(animatedPrice, 4)}
            </span>
            <span className="text-xs text-text-secondary">USDT</span>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
          <p className="mb-2 text-xs text-text-secondary">{t('change')}</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight size={16} className="text-success" />
            ) : (
              <ArrowDownRight size={16} className="text-error" />
            )}
            <span className={`font-mono text-lg font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
              {isPositive ? '+' : ''}
              {formatNumber(animatedChange, 2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleTransaction('deposit')}
          className="group rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          {t('deposit')}
        </button>
        <button
          type="button"
          onClick={() => handleTransaction('withdraw')}
          className="group rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          {t('withdraw')}
        </button>
        <button
          type="button"
          onClick={() => handleTransaction('exchange')}
          className="group rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
        >
          {t('exchange')}
        </button>
      </div>

      {modalType && (
        <TransactionModal
          open={!!modalType}
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleTransactionSubmit}
        />
      )}
    </div>
  );
}
