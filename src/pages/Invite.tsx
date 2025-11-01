import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InviteSummary } from '../components/invite/InviteSummary';
import { InviteEffect } from '../components/invite/InviteEffect';
import { InviteHistory } from '../components/invite/InviteHistory';

import { InviteHero } from '../components/invite/InviteHero';
import { PageLayout } from '../components/layout/PageLayout';
import { useHaptic } from '../hooks/useHaptic';
import { inviteService, type InviteStats } from '../services/inviteService';
import { triggerSuccessConfetti } from '../utils/confetti';

type HistoryEntry = {
  id: string;
  title: string;
  amount: string;
  status: string;
  date: string;
};

const REFRESH_INTERVAL = 60000; // 60秒

export function Invite() {
  const { t } = useTranslation(['invite', 'history']);
  const { vibrate } = useHaptic();
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [claiming, setClaiming] = useState(false);
  

  const logs = useMemo(
    () => (t('history:records', { returnObjects: true }) as HistoryEntry[] | undefined) ?? [],
    [t],
  );

  // 实时刷新邀请数据
  useEffect(() => {
    const fetchStats = async () => {
      const data = await inviteService.getRealtimeInviteStats('current_user');
      setStats(data);
    };

    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    vibrate(10);
    if (stats) {
      const link = inviteService.generateInviteLink(stats.inviteCode);
      navigator.clipboard.writeText(link);
      triggerSuccessConfetti();
      window.alert(t('invite:toasts.copied'));
    }
  };

  const handleClaim = async () => {
    if (!stats || claiming) return;
    
    vibrate(10);
    setClaiming(true);
    
    try {
      const result = await inviteService.batchClaimInviteEarnings('current_user');
      if (result.success) {
        triggerSuccessConfetti();
        window.alert(t('invite:toasts.claimed', { amount: result.amount }));
        // 刷新数据
        const newStats = await inviteService.getRealtimeInviteStats('current_user');
        setStats(newStats);
      }
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 pb-32 lg:pb-6">
        <InviteHero 
          title={t('invite:hero.title')}
          subtitle={t('invite:hero.subtitle')}
          refreshNote={t('invite:hero.refreshNote')}
          totalEarnings={stats?.totalEarnings ?? 0}
        />
        
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <InviteSummary
              stats={stats}
              buttonLabel={t('invite:actions.copy')}
              onCopy={handleCopy}
            />
            
            <InviteEffect 
              title={t('invite:effect.title')}
              subtitle={t('invite:effect.subtitle')}
              steps={(t('invite:effect.steps', { returnObjects: true }) as string[]) ?? []}
            />
            
            <InviteHistory
              heading={t('history:heading')}
              columns={(t('history:columns', { returnObjects: true }) as string[]) ?? []}
              empty={t('history:empty')}
              records={logs}
              appealLabel={t('history:appeal')}
              onAppeal={() => window.alert(t('history:appealNotice'))}
            />
          </div>
          
          <aside className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-text-primary">{t('invite:withdraw.heading')}</h2>
            <p className="text-sm text-text-secondary">{t('invite:withdraw.description')}</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-text-secondary">待领取 / Pending</p>
                <p className="mt-2 font-mono text-3xl font-bold text-[#10B981] shadow-[#10B981]/50 dark:shadow-[#10B981]/30">
                  {t('invite:withdraw.balance', { balance: stats?.pendingEarnings ?? 0 })}
                </p>
              </div>
              
              <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('invite:withdraw.gasFeeLabel')}</span>
                  <span className="font-mono font-semibold text-[#F59E0B]">
                    {t('invite:withdraw.note', { gasFee: stats?.gasFee?.toFixed(3) ?? '0.050' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-center text-text-secondary">{t('invite:withdraw.description')}</p>
              <button 
                type="button" 
                onClick={handleClaim}
                disabled={claiming || !stats || stats.pendingEarnings < 50}
                className="w-full rounded-xl border border-border-light bg-gradient-to-r from-[#10B981] to-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:ring-2 hover:ring-[#10B981]/50 hover:shadow-[#10B981]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? '...' : t('invite:actions.claim')}
              </button>
            </div>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}
