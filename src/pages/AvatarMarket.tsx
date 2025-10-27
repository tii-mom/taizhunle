import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarFilters } from '../components/avatar/AvatarFilters';
import { AvatarGrid } from '../components/avatar/AvatarGrid';
import { AvatarBlindBox } from '../components/avatar/AvatarBlindBox';
import { AvatarInventory } from '../components/avatar/AvatarInventory';
import { PageLayout } from '../components/layout/PageLayout';

type AvatarItem = {
  id: string;
  name: string;
  price: string;
  rarity: string;
  image: string;
  tradeUrl: string;
  tradeLabel: string;
  tags: string[];
};

type InventoryItem = {
  id: string;
  name: string;
  rarity: string;
  image: string;
};

export function AvatarMarket() {
  const { t } = useTranslation('avatar');
  const [filter, setFilter] = useState('all');
  const filters = useMemo(() => (t('filters.list', { returnObjects: true }) as string[]) ?? [], [t]);
  const rawItems = useMemo(() => (t('market.items', { returnObjects: true }) as AvatarItem[]) ?? [], [t]);
  const items = useMemo(() => (filter === 'all' ? rawItems : rawItems.filter((item) => item.tags.includes(filter))), [filter, rawItems]);
  const inventory = useMemo(() => (t('inventory.items', { returnObjects: true }) as InventoryItem[]) ?? [], [t]);
  return (
    <PageLayout>
      <div className="space-y-6">
      <header className="space-y-2 text-text-secondary">
        <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <AvatarFilters filters={filters} active={filter} onSelect={setFilter} />
          <AvatarGrid items={items} empty={t('market.empty')} />
          <AvatarInventory heading={t('inventory.heading')} items={inventory} empty={t('inventory.empty')} />
        </div>
        <AvatarBlindBox
          heading={t('blindbox.heading')}
          description={t('blindbox.description')}
          price={t('blindbox.price')}
          pool={t('blindbox.pool')}
          claimLabel={t('blindbox.claim')}
          historyLabel={t('blindbox.history')}
          onClaim={() => window.alert(t('blindbox.toast'))}
          onHistory={() => window.alert(t('blindbox.logNotice'))}
        />
      </section>
      </div>
    </PageLayout>
  );
}
