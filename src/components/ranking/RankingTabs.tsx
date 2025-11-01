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
          className={`flex-shrink-0 rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.key
              ? `border-transparent bg-gradient-to-r ${tab.color} text-white shadow-lg`
              : 'border-border-light bg-surface-glass/60 text-text-secondary hover:text-text-primary backdrop-blur-md'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
