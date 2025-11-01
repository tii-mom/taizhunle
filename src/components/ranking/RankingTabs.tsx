import { useTranslation } from 'react-i18next';
import type { RankingType } from '../../services/rankingService';

type Props = {
  activeTab: RankingType;
  onTabChange: (tab: RankingType) => void;
};

export function RankingTabs({ activeTab, onTabChange }: Props) {
  const { t } = useTranslation('ranking');

  const tabs: { key: RankingType; label: string; color: string }[] = [
    { key: 'invite', label: t('tabs.invite'), color: 'from-[#10B981] to-[#059669]' },
    { key: 'whale', label: t('tabs.whale'), color: 'from-[#F59E0B] to-[#D97706]' },
    { key: 'prophet', label: t('tabs.prophet'), color: 'from-[#8B5CF6] to-[#7C3AED]' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`glass-button-secondary flex-shrink-0 px-6 py-3 text-sm font-semibold ${
            activeTab === tab.key
              ? `!border-transparent bg-gradient-to-r ${tab.color} text-white shadow-[0_20px_40px_-25px_rgba(251,191,36,0.5)]`
              : 'text-white/60 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
