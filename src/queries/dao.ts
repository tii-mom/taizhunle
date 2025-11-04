/**
 * DAO Query Hooks
 * DAO 查询钩子 - 用于获取 DAO 相关数据
 */

/**
 * 获取预测市场的陪审员徽章数据
 * @param betId 预测市场 ID
 */
export const daoBadgeQuery = (betId: string) => ({
  queryKey: ['daoBadge', betId],
  queryFn: async () => {
    try {
      const response = await fetch(`/api/dao/badge/${betId}`);
      if (!response.ok) throw new Error('Failed to fetch badge');
      return await response.json();
    } catch (error) {
      console.error('DAO badge query error:', error);
      return { juryCount: 0 };
    }
  },
  staleTime: 30_000, // 30秒
  refetchInterval: 30_000,
});

/**
 * 获取 DAO 池总量
 */
export type DaoPoolCategory = {
  pending: number;
  claimed: number;
  total: number;
};

export type DaoPoolSummary = DaoPoolCategory & {
  today: number;
  last7Days: number;
};

export type DaoPoolStats = {
  create: DaoPoolCategory;
  jury: DaoPoolCategory;
  invite: DaoPoolCategory;
  platform: DaoPoolCategory;
  summary: DaoPoolSummary;
};

export const daoPoolQuery = () => ({
  queryKey: ['daoPool'],
  queryFn: async (): Promise<DaoPoolStats> => {
    try {
      const response = await fetch('/api/dao/pool-stats');
      if (!response.ok) throw new Error('Failed to fetch pool');
      const data = (await response.json()) as DaoPoolStats;
      return data;
    } catch (error) {
      console.error('DAO pool query error:', error);
      return {
        create: { pending: 0, claimed: 0, total: 0 },
        jury: { pending: 0, claimed: 0, total: 0 },
        invite: { pending: 0, claimed: 0, total: 0 },
        platform: { pending: 0, claimed: 0, total: 0 },
        summary: { pending: 0, claimed: 0, total: 0, today: 0, last7Days: 0 },
      } satisfies DaoPoolStats;
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});

/**
 * 获取用户待领取的 DAO 收益
 * @param userId 用户 ID
 */
export type DaoClaimResponse = {
  pendingAmount: number;
};

export const daoClaimQuery = (userId: string) => ({
  queryKey: ['daoClaim', userId],
  queryFn: async (): Promise<DaoClaimResponse> => {
    try {
      const response = await fetch(`/api/dao/pending/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch claim');
      const data = (await response.json()) as DaoClaimResponse;
      return data;
    } catch (error) {
      console.error('DAO claim query error:', error);
      return { pendingAmount: 0 };
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});

export type DaoStatsResponse = {
  createCount: number;
  juryCount: number;
  inviteCount: number;
  pendingAmount: number;
  claimedAmount: number;
  totalAmount: number;
  lastEarningAt?: string | null;
  lastClaimAt?: string | null;
};

export const daoStatsQuery = (userId: string) => ({
  queryKey: ['daoStats', userId],
  queryFn: async (): Promise<DaoStatsResponse> => {
    try {
      const response = await fetch(`/api/dao/stats/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = (await response.json()) as DaoStatsResponse;
      return data;
    } catch (error) {
      console.error('DAO stats query error:', error);
      return {
        createCount: 0,
        juryCount: 0,
        inviteCount: 0,
        pendingAmount: 0,
        claimedAmount: 0,
        totalAmount: 0,
        lastEarningAt: null,
        lastClaimAt: null,
      } satisfies DaoStatsResponse;
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});

export type DaoProfileResponse = {
  userId: string;
  walletAddress: string | null;
  daoPoints: number;
  isJuror: boolean;
  totalMarketsCreated: number;
  totalCreationFeeTai: number;
  winRate: number;
  lastMarketCreatedAt?: string | null;
  balance: {
    totalTai: number;
    availableTai: number;
    lockedTai: number;
  };
};

export const daoProfileQuery = (userId: string) => ({
  queryKey: ['daoProfile', userId],
  queryFn: async (): Promise<DaoProfileResponse> => {
    try {
      const response = await fetch(`/api/dao/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = (await response.json()) as DaoProfileResponse;
      return data;
    } catch (error) {
      console.error('DAO profile query error:', error);
      return {
        userId,
        walletAddress: null,
        daoPoints: 0,
        isJuror: false,
        totalMarketsCreated: 0,
        totalCreationFeeTai: 0,
        winRate: 0,
        lastMarketCreatedAt: null,
        balance: {
          totalTai: 0,
          availableTai: 0,
          lockedTai: 0,
        },
      } satisfies DaoProfileResponse;
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});
