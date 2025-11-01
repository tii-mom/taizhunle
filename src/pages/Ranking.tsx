import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RankingLive } from '../components/ranking/RankingLive';
import { RankingShare } from '../components/ranking/RankingShare';
import { RankingHero } from '../components/ranking/RankingHero';
import { RankingTabs } from '../components/ranking/RankingTabs';
import { rankingService, type RankingEntry, type RankingType } from '../services/rankingService';
import { GlassPageLayout } from '../components/glass/GlassPageLayout';

const REFRESH_INTERVAL = 60000; // 60秒

export function Ranking() {
  const { t } = useTranslation('ranking');
  const [activeTab, setActiveTab] = useState<RankingType>('invite');
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  // 实时刷新榜单数据
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const data = await rankingService.getLiveRanking(activeTab);
        setEntries(data);
        
        // 获取用户排名
        const rank = await rankingService.getUserRank('current_user', activeTab);
        setUserRank(rank);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <GlassPageLayout>
      <div className="space-y-6 pb-10">
        <RankingHero 
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
        />

        <RankingTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <RankingLive
            heading={t('live.heading')}
            updatedAt={t('live.updatedAt')}
            columns={(t('live.columns', { returnObjects: true }) as Record<string, string[]>) ?? {}}
            entries={entries}
            empty={t('live.empty')}
            loading={loading}
            rankingType={activeTab}
          />
          
          <RankingShare
            heading={t('share.heading')}
            description={t('share.description')}
            seoTitle={t('share.seoTitle')}
            seoDescription={t('share.seoDescription')}
            generateLabel={t('share.generate')}
            copyLabel={t('share.copy')}
            userRank={userRank}
          />
        </section>
      </div>
    </GlassPageLayout>
  );
}
