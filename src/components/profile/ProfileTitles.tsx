import { EmptyState } from '../common/EmptyState';

type Props = {
  heading: string;
  highlight: string;
  titles: string[];
};

export function ProfileTitles({ heading, highlight, titles }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        <span className="rounded-full border border-border px-4 py-2 text-sm text-text-secondary">{highlight}</span>
      </header>
      {titles.length === 0 ? (
        <EmptyState type="profile" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {titles.map((title) => (
            <li key={title} className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-text-secondary">
              {title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
