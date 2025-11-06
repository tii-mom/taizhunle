import { describe, it, expect, beforeEach, vi } from 'vitest';

let service: typeof import('../src/server/services/mockMarketService');
const WALLET = 'EQ-test-wallet';

describe('mock market service', () => {
  beforeEach(async () => {
    vi.resetModules();
    service = await import('../src/server/services/mockMarketService');
  });

  it('returns creation permission with stake requirements', async () => {
    const permission = await service.getCreationPermission(WALLET);
    expect(permission.requiredStakeTai).toBe(1_000);
    expect(permission.stakeCooldownHours).toBe(72);
     expect(permission.maxStakeTai).toBe(20_000);
  });

  it('creates market draft with creator stake and computes juror reward', async () => {
    const draft = await service.createMarketDraft({
      title: 'Test market',
      closesAt: new Date(Date.now() + 3600_000).toISOString(),
      minStake: 100,
      maxStake: 200_000,
      creatorStakeTai: 5_000,
    });

    expect(draft.creatorStakeTai).toBe(5_000);
    expect(draft.jurorRewardTai).toBe(100); // 最低奖励保底 100 TAI
  });

  it('updates pools and juror reward after bet', async () => {
    const draft = await service.createMarketDraft({
      title: 'Dynamic reward test',
      closesAt: new Date(Date.now() + 3600_000).toISOString(),
      minStake: 100,
      maxStake: 200_000,
      creatorStakeTai: 20_000,
    });

    const updated = await service.placeBet({
      marketId: draft.id,
      amount: 20_000,
      side: 'yes',
      walletAddress: WALLET,
    });

    expect(updated.pool).toBe(20_000);
    expect(updated.jurorRewardTai).toBe(200); // 20,000 * 1%
  });

  it('throws when wallet not provided', async () => {
    await expect(
      service.placeBet({ marketId: 'any', amount: 100, side: 'yes', walletAddress: '' })
    ).rejects.toThrow('Wallet address is required');
  });
});
