import { describe, it, expect, beforeEach, vi } from 'vitest';

const supabaseMock = {
  from: vi.fn(),
};

vi.mock('../src/server/services/supabaseClient', () => ({
  supabase: new Proxy({}, {
    get: (_target, prop) => supabaseMock[prop as keyof typeof supabaseMock],
  }),
}));

const { fetchWhaleRankings } = await import('../src/server/services/whaleService');

// helper to build supabase query mock
function mockSelect(data: unknown) {
  const selectFn = vi.fn().mockReturnThis();
  const orderFn = vi.fn().mockReturnThis();
  const limitFn = vi.fn().mockResolvedValue({ data, error: null });
  supabaseMock.from.mockReturnValue({ select: selectFn, order: orderFn, limit: limitFn });
}

describe('whaleService.fetchWhaleRankings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns formatted whale ranking list', async () => {
    const now = new Date();
    mockSelect([
      { wallet_address: '0:abcdef1234567890', amount_tai: 12345.6789, rank: 1, updated_at: now.toISOString() },
      { wallet_address: '0:1234567890abcdef', amount_tai: '999999.5', rank: 2, updated_at: null },
    ]);

    const result = await fetchWhaleRankings(2);

    expect(supabaseMock.from).toHaveBeenCalledWith('whale_rankings');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      rank: 1,
      wallet: '0:ab…7890',
      amount: 12345.6789,
      walletAddress: '0:abcdef1234567890',
    });
    expect(result[0].timestamp).toBe(now.getTime());
    expect(result[1]).toMatchObject({
      rank: 2,
      wallet: '0:12…cdef',
      amount: 999999.5,
    });
    expect(typeof result[1].timestamp).toBe('number');
  });

  it('throws when supabase returns error', async () => {
    const selectFn = vi.fn().mockReturnThis();
    const orderFn = vi.fn().mockReturnThis();
    const limitFn = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    supabaseMock.from.mockReturnValue({ select: selectFn, order: orderFn, limit: limitFn });

    await expect(fetchWhaleRankings()).rejects.toThrow('Failed to load whale rankings: boom');
  });
});
