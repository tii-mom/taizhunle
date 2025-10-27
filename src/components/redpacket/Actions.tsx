import { ShoppingCart, Gift } from 'lucide-react';

type Props = {
  buyLabel: string;
  claimLabel: string;
  onBuy: () => void;
  onClaim: () => void;
};

export function RedPacketActions({ buyLabel, claimLabel, onBuy, onClaim }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={onBuy} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-transform active:scale-95">
        <ShoppingCart size={20} />
        {buyLabel}
      </button>
      <button type="button" onClick={onClaim} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-secondary transition-transform active:scale-95">
        <Gift size={20} className="text-accent" />
        {claimLabel}
      </button>
    </div>
  );
}
