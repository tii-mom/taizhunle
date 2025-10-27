import { useState } from 'react';

type Props = {
  heading: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  generateLabel: string;
  copyLabel: string;
  template: string;
};

export function RankingShare({ heading, description, seoTitle, seoDescription, generateLabel, copyLabel, template }: Props) {
  const [payload, setPayload] = useState(template);

  const handleGenerate = () => {
    const snapshot = `${seoTitle} — ${new Date().toLocaleString()}`;
    setPayload(`${snapshot}\n${seoDescription}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      window.alert(copyLabel);
    } catch (error) {
      console.error(error);
      window.alert(copyLabel);
    }
  };

  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">{seoTitle}</p>
        <p>{seoDescription}</p>
        <textarea value={payload} onChange={(event) => setPayload(event.target.value)} className="mt-2 h-32 w-full rounded-2xl border border-border bg-background p-3" />
      </div>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleGenerate} className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast">
          {generateLabel}
        </button>
        <button type="button" onClick={handleCopy} className="w-full rounded-full border border-border px-6 py-3 text-sm text-text-secondary">
          {copyLabel}
        </button>
      </div>
    </aside>
  );
}
