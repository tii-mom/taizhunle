import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { SystemInfoGlass } from '@/components/glass/SystemInfoGlass';
import { BetModalGlass } from '@/components/glass/BetModalGlass';
import { marketDetailQuery } from '@/queries/marketDetail';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

export function MarketDetailGlass() {
  const { id = '' } = useParams();
  const { data, isPending } = useQuery(marketDetailQuery(id));
  const { t } = useI18n('home');
  const { mode } = useTheme();
  const messageClass = mode === 'light' ? 'text-slate-700' : 'text-white/70';

  if (!id) {
    return (
      <GlassPageLayout>
        <div className={`glass-card p-6 text-center text-sm ${messageClass}`}>{t('errors.missingMarket')}</div>
      </GlassPageLayout>
    );
  }

  if (isPending || !data) {
    return (
      <GlassPageLayout>
        <div className="space-y-6 pb-12">
          <div className="glass-card h-48 animate-pulse border-white/10 bg-white/5" />
          <div className="glass-card h-80 animate-pulse border-white/10 bg-white/5" />
        </div>
      </GlassPageLayout>
    );
  }

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-12">
        <SystemInfoGlass data={data.systemInfo} />
        <BetModalGlass data={data.betModal} />
      </div>
    </GlassPageLayout>
  );
}
