/**
 * 榜单服务 - Ranking Service
 * 提供实时榜单相关的API调用
 */

export interface RankingEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  delta: number;
  badge?: string;
  // 布道者专用
  inviteEarnings?: number;
  // 大富豪专用
  predictionEarnings?: number;
  // 预言家专用
  predictions?: number;
  accuracy?: number;
}

export type RankingType = 'invite' | 'whale' | 'prophet';
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

class RankingService {
  private baseUrl = '/api';

  /**
   * 获取实时榜单数据
   */
  async getLiveRanking(type: RankingType, period: RankingPeriod = 'all'): Promise<RankingEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ranking/${type}?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch ranking');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ranking:', error);
      return this.getMockRanking(type);
    }
  }

  /**
   * 获取邀请收益榜单（布道者）
   */
  async getLiveRankingInvite(): Promise<RankingEntry[]> {
    return this.getLiveRanking('invite');
  }

  /**
   * 获取大富豪榜单
   */
  async getLiveRankingWhale(): Promise<RankingEntry[]> {
    return this.getLiveRanking('whale');
  }

  /**
   * 获取预言家榜单
   */
  async getLiveRankingProphet(): Promise<RankingEntry[]> {
    return this.getLiveRanking('prophet');
  }

  /**
   * 获取用户排名
   */
  async getUserRank(userId: string, type: RankingType): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ranking/${type}/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user rank');
      const data = await response.json();
      return data.rank;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }

  /**
   * 模拟榜单数据
   */
  private getMockRanking(type: RankingType): RankingEntry[] {
    const baseData = [
      { username: 'Amber Whale', score: 1820, delta: 32 },
      { username: 'Validator Yun', score: 1640, delta: 20 },
      { username: 'DeFi Scout', score: 1505, delta: 14 },
      { username: 'Neon Diver', score: 1402, delta: 11 },
      { username: 'Sunrise Pilot', score: 1366, delta: -4 },
      { username: 'Crypto Sage', score: 1298, delta: 8 },
      { username: 'Moon Trader', score: 1245, delta: 15 },
      { username: 'Diamond Hand', score: 1189, delta: -2 },
      { username: 'Whale Hunter', score: 1156, delta: 6 },
      { username: 'Token Master', score: 1098, delta: 10 },
    ];

    return baseData.map((entry, index) => {
      const baseEntry = {
        rank: index + 1,
        userId: `user_${index + 1}`,
        username: entry.username,
        score: entry.score,
        delta: entry.delta,
        badge: this.getBadge(index + 1, type),
      };

      // 根据类型添加特定字段
      switch (type) {
        case 'invite':
          return {
            ...baseEntry,
            inviteEarnings: entry.score * 10, // 邀请收益
          };
        case 'whale':
          return {
            ...baseEntry,
            predictionEarnings: entry.score * 5, // 预测收益
          };
        case 'prophet':
          return {
            ...baseEntry,
            predictions: Math.floor(entry.score / 10), // 预测场数
            accuracy: 75 + Math.floor(Math.random() * 20), // 正确率 75-95%
          };
        default:
          return baseEntry;
      }
    });
  }

  /**
   * 获取徽章
   */
  private getBadge(rank: number, type: RankingType): string | undefined {
    if (rank > 50) return undefined;
    
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    
    switch (type) {
      case 'invite':
        return '🧙';
      case 'whale':
        return '💰';
      case 'prophet':
        return '🔮';
      default:
        return undefined;
    }
  }
}

export const rankingService = new RankingService();
