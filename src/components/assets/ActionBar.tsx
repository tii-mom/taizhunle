import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Gift, Trophy } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';

export function ActionBar() {
  const { t } = useTranslation('assets');
  const navigate = useNavigate();
  const { vibrate } = useHaptic();

  const handleAction = (path: string) => {
    vibrate(10);
    navigate(path);
  };

  return (
    <div className="sticky bottom-20 z-10 grid grid-cols-3 gap-3 rounded-2xl border border-border-light bg-surface-glass/80 p-4 shadow-2xl backdrop-blur-md lg:bottom-4">
      <button
        type="button"
        onClick={() => handleAction('/create')}
        className="flex flex-col items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 py-4 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
      >
        <PlusCircle size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('createPrediction')}</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('/assets/redpacket')}
        className="flex flex-col items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 py-4 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
      >
        <Gift size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('claimRedPacket')}</span>
      </button>

      <button
        type="button"
        onClick={() => handleAction('/ranking')}
        className="flex flex-col items-center gap-2 rounded-xl border border-border-light bg-surface-glass/60 py-4 backdrop-blur-md transition-all duration-200 hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95"
      >
        <Trophy size={24} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">{t('viewRanking')}</span>
      </button>
    </div>
  );
}
