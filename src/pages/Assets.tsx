import { useTranslation } from 'react-i18next';
import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { GlassCard } from '../components/glass/GlassCard';
import { GoldenHammer } from '../components/glass/GoldenHammer';
import { AssetHeader } from '../components/assets/AssetHeader';
import { AssetTrendDashboard } from '../components/assets/AssetTrendDashboard';
import { FinanceSections } from '../components/assets/FinanceSections';

export function Assets() {
  const { t } = useTranslation('assets');
  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <GlassCard className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="glass-section-title">{t('title')}</p>
            <p className="mt-2 text-sm text-white/70">{t('subtitle')}</p>
          </div>
          <div className="glass-tile flex items-center gap-2 px-4 py-2">
            <GoldenHammer count={3} level="gold" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Vault</span>
          </div>
        </GlassCard>

        <AssetHeader />
        <AssetTrendDashboard />
        <FinanceSections />
      </div>
    </GlassPageLayout>
  );
}
