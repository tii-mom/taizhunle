/**
 * DAO Utility Functions
 * DAO 工具函数 - 用于 DAO 相关操作
 */

/**
 * 一键领取 DAO 收益
 * @returns 领取的金额
 */
export async function claimDao(): Promise<number> {
  try {
    // 获取待领取金额
    const response = await fetch('/api/dao/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'current_user' }), // TODO: 替换为真实用户 ID
    });

    if (!response.ok) {
      throw new Error('Claim failed');
    }

    const data = await response.json();
    return data.claimedAmount || 0;
  } catch (error) {
    console.error('Claim DAO error:', error);
    throw error;
  }
}

/**
 * 获取用户的 DAO 等级徽章
 * @param points 用户点数
 * @returns 徽章信息
 */
export function getDaoBadge(points: number): { emoji: string; name: string; color: string } {
  if (points >= 200) {
    return { emoji: '🔨', name: '金色锤', color: '#F59E0B' };
  }
  if (points >= 50) {
    return { emoji: '🔨', name: '银色锤', color: '#9CA3AF' };
  }
  if (points >= 10) {
    return { emoji: '🔨', name: '铜色锤', color: '#D97706' };
  }
  return { emoji: '🔨', name: '灰色锤', color: '#6B7280' };
}

/**
 * 计算下一等级所需点数
 * @param currentPoints 当前点数
 * @returns 下一等级所需点数
 */
export function getNextLevelPoints(currentPoints: number): number {
  if (currentPoints < 10) return 10;
  if (currentPoints < 50) return 50;
  if (currentPoints < 200) return 200;
  return 200; // 已达最高等级
}
