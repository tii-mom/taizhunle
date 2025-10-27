type Props = {
  heading: string;
  description: string;
  buttonLabel: string;
  notice: string;
};

export function ProfileBlindBox({ heading, description, buttonLabel, notice }: Props) {
  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p>{notice}</p>
      </div>
      <button type="button" className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
        {buttonLabel}
      </button>
    </aside>
  );
}
