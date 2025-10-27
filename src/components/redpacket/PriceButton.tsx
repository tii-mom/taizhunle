import { ShoppingCart } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';
import { formatTON } from '../../utils/format';

type Props = {
  priceTON: number;
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export function PriceButton({ priceTON, label, disabled = false, onClick }: Props) {
  const { vibrate } = useHaptic();

  const handleClick = () => {
    vibrate(10);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-accent to-accent-light p-6 text-left shadow-lg transition-all hover:shadow-accent/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent-contrast/80">{label}</p>
          <p className="font-mono text-3xl font-bold text-accent-contrast">
            {formatTON(priceTON)} TON
          </p>
        </div>
        <ShoppingCart className="h-8 w-8 text-accent-contrast/80" />
      </div>
      <div className="absolute inset-0 rounded-xl ring-2 ring-accent/50 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
