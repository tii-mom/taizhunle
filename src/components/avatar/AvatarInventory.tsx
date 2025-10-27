type Item = {
  id: string;
  name: string;
  rarity: string;
  image: string;
  tags?: string[];
};

type Props = {
  heading: string;
  items: Item[];
  empty: string;
};

export function AvatarInventory({ heading, items, empty }: Props) {
  return (
    <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
      <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-border/60 bg-background/40 px-4 py-6 text-center text-sm text-text-secondary">{empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4">
              <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl border border-border object-cover" loading="lazy" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                <p className="text-xs uppercase tracking-wide text-text-secondary">{item.rarity}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
