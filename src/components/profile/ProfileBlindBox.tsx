import { Gift } from 'lucide-react';

type Props = {
  heading: string;
  description: string;
  buttonLabel: string;
  notice: string;
};

export function ProfileBlindBox({ heading, description, buttonLabel, notice }: Props) {
  return (
    <aside className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p>{notice}</p>
      </div>
      <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-accent-contrast shadow-inner transition-transform active:scale-95">
        <Gift size={20} />
        {buttonLabel}
      </button>
    </aside>
  );
}
