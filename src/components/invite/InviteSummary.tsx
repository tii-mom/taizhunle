import { Copy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptic } from '../../hooks/useHaptic';
import type { InviteStats } from '../../services/inviteService';

type Props = {
  stats: InviteStats | null;
  buttonLabel: string;
  onCopy: () => void;
};

export function InviteSummary({ stats, buttonLabel, onCopy }: Props) {
  const { t } = useTranslation('invite');
  const { vibrate } = useHaptic();

  const handleCopy = () => {
    vibrate(10);
    onCopy();
  };

  if (!stats) {
    return (
      <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-surface-glass/60" />
          <div className="h-24 w-full rounded bg-surface-glass/60" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{t('summary.stats.0')}</p>
          <h2 className="font-mono text-3xl font-bold text-[#10B981] shadow-[#10B981]/50 dark:shadow-[#10B981]/30">
            {t('summary.stats.1')}
          </h2>
        </div>
        <button 
          type="button" 
          onClick={handleCopy} 
          className="inline-flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-gradient-to-r from-[#10B981] to-[#059669] px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-[#10B981]/50 hover:shadow-[#10B981]/20 active:scale-95"
        >
          <Share2 size={16} />
          {buttonLabel}
        </button>
      </header>
      
      <div className="rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        <p className="text-xs uppercase tracking-wide text-text-secondary">{t('summary.stats.2')}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="font-mono text-lg font-semibold text-text-primary">{stats.inviteCode}</p>
          <button 
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-1 transition-colors hover:bg-surface-glass/60"
          >
            <Copy size={16} className="text-[#10B981]" />
          </button>
        </div>
        <p className="mt-2 text-sm text-text-secondary">{t('summary.stats.3')}</p>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        <article className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 backdrop-blur-md duration-200">
          <p className="text-xs uppercase tracking-wide text-text-secondary">累计邀请 / Total Invites</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#10B981]">{stats.totalInvites}</p>
        </article>
        
        <article className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 backdrop-blur-md duration-200" style={{ animationDelay: '50ms' }}>
          <p className="text-xs uppercase tracking-wide text-text-secondary">活跃交易 / Active Traders</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#10B981]">{stats.activeTraders}</p>
        </article>
        
        <article className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border-light bg-surface-glass/60 px-4 py-3 backdrop-blur-md duration-200" style={{ animationDelay: '100ms' }}>
          <p className="text-xs uppercase tracking-wide text-text-secondary">待发返利 / Pending</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F59E0B]">{stats.pendingEarnings} TAI</p>
        </article>
      </div>
    </section>
  );
}
