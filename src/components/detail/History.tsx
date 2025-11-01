import { useI18n } from '../../hooks/useI18n';
import { GlassCard } from '../glass/GlassCard';

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
  const { t } = useI18n('detail');
  if (items.length === 0) {
    return <GlassCard className="p-6 text-sm text-white/60">{empty}</GlassCard>;
  }
  return (
    <GlassCard className="space-y-4 p-6">
      <h2 className="text-xl font-semibold text-white">{t('history')}</h2>
      <div className="space-y-2 text-sm">
        <header className="glass-card-sm grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60">
          <span>{t('historyColumns.user')}</span>
          <span>{t('historyColumns.amount')}</span>
          <span>{t('historyColumns.side')}</span>
          <span>{t('historyColumns.time')}</span>
        </header>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="glass-card-sm grid grid-cols-[2fr,1fr,1fr,1fr] items-center gap-4 px-4 py-3 text-white/80"
            >
              <span className="font-medium text-white">{item.user}</span>
              <span>{item.amount}</span>
              <span>{item.side}</span>
              <span className="text-white/60">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
