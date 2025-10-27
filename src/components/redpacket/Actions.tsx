type Props = {
  buyLabel: string;
  claimLabel: string;
  onBuy: () => void;
  onClaim: () => void;
};

export function RedPacketActions({ buyLabel, claimLabel, onBuy, onClaim }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={onBuy} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
        {buyLabel}
      </button>
      <button type="button" onClick={onClaim} className="rounded-full border border-border px-6 py-3 text-sm text-text-secondary">
        {claimLabel}
      </button>
    </div>
  );
}
