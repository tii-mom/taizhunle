import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { GlassPageLayout } from '@/components/glass/GlassPageLayout';
import { BetModalGlass } from '@/components/glass/BetModalGlass';
import { betQuery } from '@/queries/bet';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/providers/ThemeProvider';

export function BetGlass() {
  const { id = '' } = useParams();
  const { data, isPending } = useQuery(betQuery(id));
  const { t } = useI18n('home');
  const { mode } = useTheme();
  const messageClass = mode === 'light' ? 'text-slate-700' : 'text-white/70';

  if (!id) {
    return (
      <GlassPageLayout>
        <div className={`glass-card p-6 text-center text-sm ${messageClass}`}>{t('errors.missingBet')}</div>
      </GlassPageLayout>
    );
  }

  return (
    <GlassPageLayout>
      <div className="pb-12">
        {isPending || !data ? (
          <div className="glass-card h-96 animate-pulse border-white/10 bg-white/5" />
        ) : (
          <BetModalGlass data={data} />
        )}
      </div>
    </GlassPageLayout>
  );
}
