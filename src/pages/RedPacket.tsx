import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { RedPacketTabs } from '../components/redpacket/Tabs';
import { RedPacketList, type RedPacketItem } from '../components/redpacket/List';
import { RedPacketMarquee } from '../components/redpacket/Marquee';
import { RedPacketActions } from '../components/redpacket/Actions';
import { PageLayout } from '../components/layout/PageLayout';

type TabKey = 'official' | 'personal' | 'community';

export function RedPacket() {
  const { t } = useTranslation('redpacket');
  const [active, setActive] = useState<TabKey>('official');
  const tabs = useMemo(
    () => [
      { key: 'official' as TabKey, label: t('tabs.official') },
      { key: 'personal' as TabKey, label: t('tabs.personal') },
      { key: 'community' as TabKey, label: t('tabs.community') },
    ],
    [t],
  );
  const dataset = useMemo(
    () => (t(`lists.${active}`, { returnObjects: true }) as RedPacketItem[] | undefined) ?? [],
    [active, t],
  );
  return (
    <PageLayout>
      <div className="space-y-6">
      <header className="space-y-2 text-text-secondary">
        <h1 className="text-3xl font-semibold text-text-primary">{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>
      <RedPacketMarquee items={(t('marquee', { returnObjects: true }) as string[]) ?? []} />
      <section className="space-y-4 rounded-xl border border-light bg-surface-glass p-6 shadow-2xl backdrop-blur-lg">
        <RedPacketTabs tabs={tabs} active={active} onSelect={setActive} />
        <RedPacketActions
          buyLabel={t('actions.buy')}
          claimLabel={t('actions.claim')}
          onBuy={() => window.alert(t('toasts.buy'))}
          onClaim={() => window.alert(t('toasts.claim'))}
        />
        <RedPacketList
          empty={t('empty')}
          items={dataset}
          meta={{ valueLabel: t('columns.value'), claimLabel: t('columns.claimed'), expiryLabel: t('columns.expiry'), statusLabel: t('columns.status') }}
        />
      </section>
      </div>
    </PageLayout>
  );
}
