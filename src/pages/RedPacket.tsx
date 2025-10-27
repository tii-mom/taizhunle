import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RedPacketTabs } from '../components/redpacket/Tabs';
import { RedPacketList, type RedPacketItem } from '../components/redpacket/List';
import { RedPacketMarquee } from '../components/redpacket/Marquee';
import { RedPacketActions } from '../components/redpacket/Actions';
import { PageLayout } from '../components/layout/PageLayout';

type TabKey = 'official' | 'personal' | 'community';

export function RedPacket() {
  const { t } = useTranslation('redpacket');
  const navigate = useNavigate();
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
      
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/red-packet/sale')}
          className="group relative overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-accent/20 to-accent-light/20 p-6 text-left transition-all hover:shadow-lg hover:shadow-accent/20 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-2">
            <h3 className="text-xl font-semibold text-text-primary">{t('sale.title')}</h3>
            <p className="text-sm text-text-secondary">{t('sale.subtitle')}</p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/red-packet/official')}
          className="group relative overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-accent/20 to-accent-light/20 p-6 text-left transition-all hover:shadow-lg hover:shadow-accent/20 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-2">
            <h3 className="text-xl font-semibold text-text-primary">{t('official.title')}</h3>
            <p className="text-sm text-text-secondary">{t('official.subtitle')}</p>
          </div>
        </button>
      </div>
      
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
