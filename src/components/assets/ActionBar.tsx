import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Gift, Trophy } from 'lucide-react';

import { useHaptic } from '../../hooks/useHaptic';
import { GlassCard } from '../glass/GlassCard';

export function ActionBar() {
  const { t } = useTranslation('assets');
  const navigate = useNavigate();
  const { vibrate } = useHaptic();

  const handleAction = (path: string) => {
    vibrate(10);
    navigate(path);
  };

  return (
    <GlassCard className="sticky bottom-20 z-10 grid grid-cols-3 gap-3 p-4 lg:bottom-4">
      <button
        type="button"
        onClick={() => handleAction('/create')}
        className="glass-button-secondary flex flex-col items-center gap-2 !rounded-2xl !py-4"
      >
        <PlusCircle size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('createPrediction')}</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('/assets/redpacket')}
        className="glass-button-secondary flex flex-col items-center gap-2 !rounded-2xl !py-4"
      >
        <Gift size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('claimRedPacket')}</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('/ranking')}
        className="glass-button-secondary flex flex-col items-center gap-2 !rounded-2xl !py-4"
      >
        <Trophy size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('viewRanking')}</span>
      </button>
    </GlassCard>
  );
}
