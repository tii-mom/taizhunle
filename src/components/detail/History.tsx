import { useTranslation } from 'react-i18next';

type Item = {
  key: string;
  user: string;
  amount: string;
  side: string;
  time: string;
};

type Props = {
  items: Item[];
  empty: string;
};

export function DetailHistory({ items, empty }: Props) {
  const { t } = useTranslation('detail');
  if (items.length === 0) {
    return <section className="rounded-3xl border border-border bg-surface p-6 text-sm text-text-secondary">{empty}</section>;
  }
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <h2 className="text-xl font-semibold text-text-primary">{t('history')}</h2>
      <div className="space-y-2 text-sm">
        <header className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-xs uppercase tracking-wide text-text-secondary">
          <span>{t('historyColumns.user')}</span>
          <span>{t('historyColumns.amount')}</span>
          <span>{t('historyColumns.side')}</span>
          <span>{t('historyColumns.time')}</span>
        </header>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-[2fr,1fr,1fr,1fr] items-center gap-4 rounded-2xl border border-border/40 bg-background/40 px-4 py-3">
              <span className="font-medium text-text-primary">{item.user}</span>
              <span className="text-text-secondary">{item.amount}</span>
              <span>{item.side}</span>
              <span className="text-text-secondary">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
