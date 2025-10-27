type Props = {
  heading: string;
  description: string;
  price: string;
  pool: string;
  claimLabel: string;
  historyLabel: string;
  onClaim: () => void;
  onHistory: () => void;
};

export function AvatarBlindBox({ heading, description, price, pool, claimLabel, historyLabel, onClaim, onHistory }: Props) {
  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p className="text-lg font-semibold text-text-primary">{price}</p>
        <p>{pool}</p>
      </div>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={onClaim} className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
          {claimLabel}
        </button>
        <button type="button" onClick={onHistory} className="w-full rounded-full border border-border px-6 py-3 text-sm text-text-secondary">
          {historyLabel}
        </button>
      </div>
    </aside>
  );
}
