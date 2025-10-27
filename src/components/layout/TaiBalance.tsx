import { useTranslation } from 'react-i18next';
import { Wallet, TrendingUp } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatTAI } from '../../utils/format';

type Props = {
  balance: number;
  todayProfit: number;
};

export function TaiBalance({ balance, todayProfit }: Props) {
  const { t } = useTranslation('market');
  const animatedBalance = useCountUp(balance);
  const animatedProfit = useCountUp(todayProfit);

  const profitColor = todayProfit >= 0 ? 'text-green-500' : 'text-red-500';
  const profitSign = todayProfit >= 0 ? '+' : '';

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* TAI Balance */}
      <div className="flex items-center gap-3 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 backdrop-blur-md">
        <Wallet className="h-5 w-5 text-accent" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary drop-shadow-[0_0_6px_rgba(var(--accent),0.5)]">
            {t('balance.label')}
          </p>
          <p className="font-mono text-lg font-bold text-accent drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]">
            {formatTAI(animatedBalance)} TAI
          </p>
        </div>
      </div>

      {/* Today Profit */}
      <div className="flex items-center gap-3 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-2 backdrop-blur-md">
        <TrendingUp className={`h-5 w-5 ${profitColor}`} />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary drop-shadow-[0_0_6px_rgba(var(--accent),0.5)]">
            {t('balance.todayProfit')}
          </p>
          <p className={`font-mono text-lg font-bold drop-shadow-[0_0_10px_rgba(var(--accent),0.5)] ${profitColor}`}>
            {profitSign}{formatTAI(animatedProfit)} TAI
          </p>
        </div>
      </div>
    </div>
  );
}
