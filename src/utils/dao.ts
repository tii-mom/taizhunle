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
 * 获取用户的 DAO 等级信息
 * @param points 用户点数
 * @returns 等级信息
 */
export function getJurorLevel(points: number): {
  level: number;
  name: string;
  emoji: string;
  dailyLimit: number;
  color: string;
} {
  if (points >= 1000) {
    return {
      level: 4,
      name: '天上天下天地无双',
      emoji: '⚡👑',
      dailyLimit: Infinity,
      color: '#F59E0B',
    };
  }
  if (points >= 400) {
    return {
      level: 3,
      name: '地狱判官',
      emoji: '⚔️👹',
      dailyLimit: 30,
      color: '#9CA3AF',
    };
  }
  if (points >= 100) {
    return {
      level: 2,
      name: '风尘奇侠',
      emoji: '🗡️🌪️',
      dailyLimit: 9,
      color: '#D97706',
    };
  }
  return {
    level: 1,
    name: '武林新丁',
    emoji: '🥋',
    dailyLimit: 3,
    color: '#6B7280',
  };
}

/**
 * 计算下一等级所需点数
 * @param currentPoints 当前点数
 * @returns 下一等级所需点数
 */
export function getNextLevelPoints(currentPoints: number): number {
  if (currentPoints < 100) return 100;
  if (currentPoints < 400) return 400;
  if (currentPoints < 1000) return 1000;
  return 1000; // 已达最高等级
}

/**
 * 计算质押倍数加成的积分
 * @param stakedAmount 质押金额
 * @returns 单次陪审获得的积分
 */
export function calculatePointsEarned(stakedAmount: number): number {
  const BASE_STAKE = 10000; // 基础质押 10,000 TAI
  const multiplier = Math.floor(stakedAmount / BASE_STAKE);
  return Math.min(multiplier, 10); // 上限 10 分
}

/**
 * 计算抽签权重
 * @param points 积分
 * @param stakedAmount 质押金额
 * @returns 权重值
 */
export function calculateWeight(points: number, stakedAmount: number): number {
  return (points + 10) * stakedAmount;
}


/**
 * 获取创建预测的时间间隔（小时）
 * @param points 用户积分
 * @param isJuror 是否是陪审员
 * @returns 创建间隔（小时）
 */
export function getCreateInterval(points: number, isJuror: boolean): number {
  if (!isJuror) {
    return 360;
  }

  if (points >= 1000) return 6;
  if (points >= 400) return 24;
  if (points >= 100) return 48;
  if (points >= 0) return 72;
  return 360;
}

/**
 * 检查是否可以创建预测
 * @param lastCreateTime 最后创建时间
 * @param points 用户积分
 * @param isJuror 是否是陪审员
 * @returns 是否可以创建和下次可创建时间
 */

export function getCreationStakeRequirement(points: number): {
  stake: number;
  cooldownHours: number;
  maxStake: number;
} {
  const MAX_STAKE_LIMIT = 20_000;
  if (points >= 1000) {
    return { stake: 20_000, cooldownHours: 6, maxStake: MAX_STAKE_LIMIT };
  }
  if (points >= 400) {
    return { stake: 10_000, cooldownHours: 24, maxStake: MAX_STAKE_LIMIT };
  }
  if (points >= 100) {
    return { stake: 5_000, cooldownHours: 48, maxStake: MAX_STAKE_LIMIT };
  }
  return { stake: 1_000, cooldownHours: 72, maxStake: MAX_STAKE_LIMIT };
}

export function canCreateMarket(
  lastCreateTime: Date | null,
  points: number,
  isJuror: boolean,
): {
  canCreate: boolean;
  nextAvailableTime: Date | null;
  intervalHours: number;
  hoursRemaining: number;
} {
  const intervalHours = getCreateInterval(points, isJuror);

  if (!lastCreateTime) {
    return {
      canCreate: true,
      nextAvailableTime: null,
      intervalHours,
      hoursRemaining: 0,
    };
  }

  const now = new Date();
  const hoursSinceLastCreate = (now.getTime() - lastCreateTime.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastCreate >= intervalHours) {
    return {
      canCreate: true,
      nextAvailableTime: null,
      intervalHours,
      hoursRemaining: 0,
    };
  }

  const hoursRemaining = intervalHours - hoursSinceLastCreate;
  const nextAvailableTime = new Date(lastCreateTime.getTime() + intervalHours * 60 * 60 * 1000);

  return {
    canCreate: false,
    nextAvailableTime,
    intervalHours,
    hoursRemaining,
  };
}
