import { Gift, History } from 'lucide-react';

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
    <aside className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary duration-200">
        <p className="font-mono text-lg font-semibold text-accent shadow-accent/30">{price}</p>
        <p>{pool}</p>
      </div>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={onClaim} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-transform active:scale-95">
          <Gift size={20} />
          {claimLabel}
        </button>
        <button type="button" onClick={onHistory} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-text-secondary transition-transform active:scale-95">
          <History size={20} className="text-text-secondary" />
          {historyLabel}
        </button>
      </div>
    </aside>
  );
}
