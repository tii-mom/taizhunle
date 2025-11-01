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
export const daoPoolQuery = () => ({
  queryKey: ['daoPool'],
  queryFn: async () => {
    try {
      const response = await fetch('/api/dao/pool-stats');
      if (!response.ok) throw new Error('Failed to fetch pool');
      return await response.json();
    } catch (error) {
      console.error('DAO pool query error:', error);
      return { total: 0 };
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});

/**
 * 获取用户待领取的 DAO 收益
 * @param userId 用户 ID
 */
export const daoClaimQuery = (userId: string) => ({
  queryKey: ['daoClaim', userId],
  queryFn: async () => {
    try {
      const response = await fetch(`/api/dao/pending/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch claim');
      return await response.json();
    } catch (error) {
      console.error('DAO claim query error:', error);
      return { total: 0 };
    }
  },
  staleTime: 30_000,
  refetchInterval: 30_000,
});
