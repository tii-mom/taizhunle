import { describe, it, expect } from 'vitest';

import {
  getCreationPermission,
  createMarketDraft,
  placeBet,
} from '../src/server/services/mockMarketService';
import { getCreationStakeRequirement } from '../src/utils/dao';

const TEST_WALLET = 'EQ-e2e-market-wallet';

describe('mock market end-to-end flow', () => {
  it('enforces stake requirement and rewards jurors with pool × 1%', async () => {
    const permission = await getCreationPermission(TEST_WALLET);
    const stakeRequirement = getCreationStakeRequirement(permission.points);

    expect(permission.requiredStakeTai).toBe(stakeRequirement.stake);
    expect(permission.intervalHours).toBeGreaterThan(0);

    const draft = await createMarketDraft({
      title: 'E2E quality gate',
      closesAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      minStake: 1_000,
      maxStake: 250_000,
      creatorStakeTai: permission.requiredStakeTai,
    });

    expect(draft.creatorStakeTai).toBe(stakeRequirement.stake);
    expect(draft.stakeCooldownHours).toBe(stakeRequirement.cooldownHours);

    const placed = await placeBet({
      marketId: draft.id,
      amount: 25_000,
      side: 'yes',
      walletAddress: TEST_WALLET,
    });

    expect(placed.pool).toBeGreaterThanOrEqual(25_000);
    const expectedReward = Math.max(100, Math.round(placed.pool * 0.01));
    expect(placed.jurorRewardTai).toBe(expectedReward);
  });
});
