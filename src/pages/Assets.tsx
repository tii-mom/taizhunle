import { GlassPageLayout } from '../components/glass/GlassPageLayout';
import { AssetHeader } from '../components/assets/AssetHeader';
import { AssetTrendDashboard } from '../components/assets/AssetTrendDashboard';
import { FinanceSections } from '../components/assets/FinanceSections';

export function Assets() {
  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <AssetHeader />
        <AssetTrendDashboard />
        <FinanceSections />
      </div>
    </GlassPageLayout>
  );
}
