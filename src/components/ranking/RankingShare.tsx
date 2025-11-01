import { useState } from 'react';
import { Sparkles, Copy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useHaptic } from '../../hooks/useHaptic';
import { triggerSuccessConfetti } from '../../utils/confetti';
import { GlassCard } from '../glass/GlassCard';

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
    <GlassCard className="space-y-4 p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Share2 size={20} className="text-amber-200" />
          <h2 className="text-xl font-semibold text-white">{heading}</h2>
        </div>
        <p className="text-sm text-white/70">{description}</p>
      </header>

      {userRank ? (
        <div className="glass-card-sm space-y-1 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">{t('share.myRank', { rank: userRank })}</p>
          <p className="font-mono text-2xl font-bold text-amber-200">#{userRank}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="glass-card-sm space-y-2 p-4 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">{seoTitle}</p>
          <p>{seoDescription}</p>
        </div>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="glass-textarea"
          placeholder="Click generate to create share text..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleGenerate} className="glass-button-primary w-full justify-center">
          <Sparkles size={18} />
          {generateLabel}
        </button>
        <button type="button" onClick={handleCopy} className="glass-button-secondary w-full justify-center">
          <Copy size={18} className="text-amber-200" />
          {copyLabel}
        </button>
      </div>
    </GlassCard>
  );
}
