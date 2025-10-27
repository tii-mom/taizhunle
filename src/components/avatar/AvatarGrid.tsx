type Item = {
  id: string;
  name: string;
  price: string;
  rarity: string;
  image: string;
  tradeUrl: string;
  tradeLabel: string;
};

type Props = {
  items: Item[];
  empty: string;
};

export function AvatarGrid({ items, empty }: Props) {
  if (items.length === 0) {
    return <p className="rounded-xl border border-light bg-surface-glass p-6 text-sm text-text-secondary backdrop-blur-lg shadow-2xl">{empty}</p>;
  }
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{item.name}</h3>
              <p className="text-sm text-text-secondary">{item.rarity}</p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary">{item.price}</span>
          </div>
          <img src={item.image} alt={item.name} className="h-40 w-full rounded-2xl border border-border object-cover" loading="lazy" />
          <button
            type="button"
            onClick={() => window.open(item.tradeUrl, '_blank', 'noopener')}
            className="w-full rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-transform hover:text-text-primary active:scale-95"
          >
            {item.tradeLabel}
          </button>
        </article>
      ))}
    </section>
  );
}
