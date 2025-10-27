import { EmptyState } from '../common/EmptyState';

export type RedPacketItem = {
  id: string;
  title: string;
  description: string;
  value: string;
  claimed: string;
  expiry: string;
  status: string;
  badge?: string;
};

type ListMeta = {
  valueLabel: string;
  claimLabel: string;
  expiryLabel: string;
  statusLabel: string;
};

type Props = {
  empty: string;
  items: RedPacketItem[];
  meta: ListMeta;
};

export function RedPacketList({ empty: _empty, items, meta }: Props) {
  if (!items || items.length === 0) {
    return <EmptyState type="redPacket" />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="space-y-3 rounded-xl border border-light bg-surface-glass/50 p-4 backdrop-blur-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{item.title}</h2>
              <p className="text-sm text-text-secondary">{item.description}</p>
            </div>
            {item.badge ? <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-text-secondary">{item.badge}</span> : null}
          </header>
          <dl className="grid gap-3 text-sm md:grid-cols-4">
            <Detail label={meta.valueLabel} value={item.value} />
            <Detail label={meta.claimLabel} value={item.claimed} />
            <Detail label={meta.expiryLabel} value={item.expiry} />
            <Detail label={meta.statusLabel} value={item.status} />
          </dl>
        </article>
      ))}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/40 p-3">
      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="text-sm font-medium text-text-primary md:text-base">{value}</dd>
    </div>
  );
}
