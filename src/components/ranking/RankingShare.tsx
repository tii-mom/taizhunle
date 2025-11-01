import { useState } from 'react';
import { Sparkles, Copy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptic } from '../../hooks/useHaptic';
import { triggerSuccessConfetti } from '../../utils/confetti';

type Props = {
  heading: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  generateLabel: string;
  copyLabel: string;
  userRank: number | null;
};

export function RankingShare({ heading, description, seoTitle, seoDescription, generateLabel, copyLabel, userRank }: Props) {
  const { t } = useTranslation('ranking');
  const [payload, setPayload] = useState('');
  const { vibrate } = useHaptic();

  const handleGenerate = () => {
    vibrate(10);
    const rankText = userRank ? t('share.template', { rank: userRank }) : seoTitle;
    const snapshot = `${rankText}\n${seoDescription}\n${new Date().toLocaleString()}`;
    setPayload(snapshot);
  };

  const handleCopy = async () => {
    vibrate(10);
    try {
      await navigator.clipboard.writeText(payload || `${seoTitle}\n${seoDescription}`);
      triggerSuccessConfetti();
      window.alert(copyLabel);
    } catch (error) {
      console.error(error);
      window.alert(copyLabel);
    }
  };

  return (
    <aside className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2">
          <Share2 size={20} className="text-[#F59E0B]" />
          <h2 className="text-xl font-semibold text-text-primary">{heading}</h2>
        </div>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>

      {userRank && (
        <div className="rounded-xl border border-[#F59E0B]/30 bg-gradient-to-r from-[#F59E0B]/10 to-surface-glass/60 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{t('share.myRank', { rank: userRank })}</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F59E0B]">#{userRank}</p>
        </div>
      )}
      
      <div className="space-y-3 rounded-xl border border-border-light bg-surface-glass/60 p-4 backdrop-blur-md">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-text-secondary">{seoTitle}</p>
          <p className="text-sm text-text-secondary">{seoDescription}</p>
        </div>
        <textarea 
          value={payload} 
          onChange={(event) => setPayload(event.target.value)} 
          className="h-32 w-full rounded-xl border border-border-light bg-surface-glass/60 p-3 text-sm text-text-primary backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50" 
          placeholder="Click generate to create share text..."
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <button 
          type="button" 
          onClick={handleGenerate} 
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:ring-2 hover:ring-[#F59E0B]/50 hover:shadow-[#F59E0B]/20 active:scale-95"
        >
          <Sparkles size={20} />
          {generateLabel}
        </button>
        <button 
          type="button" 
          onClick={handleCopy} 
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 px-6 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-[#F59E0B]/50 hover:shadow-[#F59E0B]/20 active:scale-95"
        >
          <Copy size={20} className="text-[#F59E0B]" />
          {copyLabel}
        </button>
      </div>
    </aside>
  );
}
