import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { PredictionRow, UserRow } from '../src/server/types/database';

const ensureUserByWallet = vi.fn();
const notifyAdmins = vi.fn();
const notifyChannel = vi.fn();
const predictionsInsertSpy = vi.fn();
const usersUpdateSpy = vi.fn();
const supabaseFrom = vi.fn();

vi.mock('../src/server/services/userService.js', () => ({
  ensureUserByWallet,
  incrementUserStats: vi.fn(),
}));

vi.mock('../src/server/services/telegramService.js', () => ({
  notifyAdmins,
  notifyChannel,
}));

vi.mock('../src/server/services/supabaseClient.js', () => ({
  supabase: {
    from: supabaseFrom,
  },
}));

vi.mock('../src/server/services/feeDistributor.js', () => ({
  distributeFees: vi.fn(),
  sendToPools: vi.fn(),
}));

let lastInsertedRow: PredictionRow;

function buildPredictionRow(payload: Partial<PredictionRow>): PredictionRow {
  const nowIso = new Date('2025-01-01T00:00:00Z').toISOString();
  return {
    id: payload.id ?? 'prediction-test',
    title: payload.title ?? 'Test',
    description: payload.description ?? payload.title ?? 'Test',
    creator_id: payload.creator_id ?? 'user-1',
    end_time: payload.end_time ?? new Date(Date.now() + 3600_000).toISOString(),
    settlement_time: payload.settlement_time ?? null,
    status: payload.status ?? 'active',
    result: payload.result ?? null,
    base_pool: payload.base_pool ?? 0,
    total_pool: payload.total_pool ?? 0,
    yes_pool: payload.yes_pool ?? 0,
    no_pool: payload.no_pool ?? 0,
    total_fees: payload.total_fees ?? 0,
    creator_fee: payload.creator_fee ?? 0,
    platform_fee: payload.platform_fee ?? 0,
    juror_reward_tai: payload.juror_reward_tai ?? 0,
    tags: payload.tags ?? [],
    reference_url: payload.reference_url ?? null,
    admin_notes: payload.admin_notes ?? null,
    approved_by: payload.approved_by ?? null,
    approved_at: payload.approved_at ?? null,
    created_at: payload.created_at ?? nowIso,
    updated_at: payload.updated_at ?? nowIso,
  } satisfies PredictionRow;
}

supabaseFrom.mockImplementation((table: string) => {
  if (table === 'predictions') {
    return {
      insert: (payload: Partial<PredictionRow>) => {
        predictionsInsertSpy(payload);
        lastInsertedRow = buildPredictionRow(payload);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: lastInsertedRow, error: null }),
          }),
        };
      },
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      }),
    };
  }

  if (table === 'users') {
    return {
      update: (payload: Record<string, unknown>) => {
        usersUpdateSpy(payload);
        return {
          eq: () => ({ error: null }),
        };
      },
    };
  }

  throw new Error(`Unexpected table ${table}`);
});

const { createMarketDraft, getMarketCreationPermission } = await import('../src/server/services/marketService');

function mockUser(overrides: Partial<UserRow> = {}): UserRow {
  const baseTime = new Date('2025-01-01T00:00:00Z').toISOString();
  return {
    id: 'user-1',
    wallet_address: 'EQ-user',
    telegram_id: null,
    telegram_username: null,
    first_name: null,
    last_name: null,
    language_code: 'zh',
    is_premium: null,
    dao_points: 0,
    is_juror: true,
    last_market_created_at: baseTime,
    total_markets_created: 3,
    total_creation_fee_tai: 0,
    total_bets: 0,
    total_winnings: 0,
    total_losses: 0,
    win_rate: null,
    is_active: true,
    is_blacklisted: false,
    last_active_at: null,
    created_at: baseTime,
    updated_at: baseTime,
    ...overrides,
  } satisfies UserRow;
}

describe('marketService creation & permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates market draft with correct stake and cooldown for high tier juror', async () => {
    const lastCreate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    ensureUserByWallet.mockResolvedValue(
      mockUser({ dao_points: 450, is_juror: true, last_market_created_at: lastCreate }),
    );

    const result = await createMarketDraft({
      title: 'Stake-enforced market',
      closesAt: new Date(Date.now() + 86400000).toISOString(),
      minStake: 1000,
      maxStake: 50000,
      creatorWallet: 'EQ-user',
      creatorStakeTai: 10_000,
      tags: ['sports', 'society'],
      referenceUrl: 'https://espn.example.com/messi',
    });

    expect(result.creatorStakeTai).toBe(10_000);
    expect(result.stakeCooldownHours).toBe(24);
    expect(result.tags).toEqual(['sports', 'society']);
    expect(result.referenceUrl).toBe('https://espn.example.com/messi');
    expect(predictionsInsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        creator_fee: 10_000,
        admin_notes: expect.stringContaining('"creatorStakeTai"'),
        tags: ['sports', 'society'],
        reference_url: 'https://espn.example.com/messi',
      }),
    );
    expect(usersUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ total_markets_created: 4 }),
    );
    expect(notifyAdmins).toHaveBeenCalledWith(expect.stringContaining('10,000'));
    expect(notifyChannel).toHaveBeenCalled();
  });

  it('rejects creation when provided stake does not match tier requirement', async () => {
    ensureUserByWallet.mockResolvedValue(
      mockUser({ dao_points: 150, is_juror: true, last_market_created_at: new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString() }),
    );

    await expect(
      createMarketDraft({
        title: 'Invalid stake market',
        closesAt: new Date(Date.now() + 86400000).toISOString(),
        minStake: 500,
        maxStake: 5000,
        creatorWallet: 'EQ-user',
        creatorStakeTai: 1_000,
      }),
    ).rejects.toThrow('Stake must be at least 5,000 TAI for your level.');
  });

  it('computes creation permission with remaining cooldown for juror tier', async () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-04T00:00:00Z');
    vi.setSystemTime(now);

    const lastCreate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    ensureUserByWallet.mockResolvedValue(
      mockUser({ dao_points: 50, is_juror: true, last_market_created_at: lastCreate }),
    );

    const permission = await getMarketCreationPermission(' EQ-new-wallet ');

    expect(permission.walletAddress).toBe('EQ-new-wallet');
    expect(permission.requiredStakeTai).toBe(1_000);
    expect(permission.intervalHours).toBe(72);
    expect(permission.canCreate).toBe(false);
    expect(permission.stakeCooldownHours).toBe(72);
    expect(permission.maxStakeTai).toBe(20_000);
    expect(permission.hoursRemaining).toBeCloseTo(48, 1);
    expect(permission.nextAvailableTime).toMatch('2025-01-06');
  });
});
