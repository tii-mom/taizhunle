import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

export type MarketFilter = 'all' | 'live' | 'closed' | 'my';
export type MarketSortKey = 'latest' | 'hot' | 'closing' | 'bounty' | 'following';

export type MarketBet = {
  id: string;
  user: string;
  amount: number;
  market: string;
  direction: 'long' | 'short';
  side: 'yes' | 'no';
  odds: number;
  potentialPayout: number;
  walletAddress?: string | null;
  timestamp: number;
};

export type MarketCard = {
  id: string;
  filter: 'live' | 'closed';
  title: string;
  description: string;
  status: string;
  odds: string;
  yesOdds: number;
  noOdds: number;
  yesPool: number;
  noPool: number;
  volume: string;
  pool: number;
  bets: MarketBet[];
  endsAt: number;
  createdAt: number;
  targetPool: number;
  entities: string[];
  bountyMultiplier: number;
  juryCount: number;
  followers: string[];
  isFavorite?: boolean;
  liquidity?: string;
  participants?: number;
  jurorRewardTai: number;
};

export type MarketFeedRequest = {
  sort: MarketSortKey;
  cursor?: string;
  limit?: number;
  filter?: MarketFilter;
};

export type MarketFeedResponse = {
  items: MarketCard[];
  nextCursor?: string;
  daoPool?: number;
};

export type MarketSnapshot = {
  id: string;
  title: string;
  pool: number;
  participants: number;
  endTime: number;
  juryCount: number;
  targetPool: number;
};

export type MarketCreationPermission = {
  walletAddress: string;
  canCreate: boolean;
  points: number;
  isJuror: boolean;
  intervalHours: number;
  hoursRemaining: number;
  nextAvailableTime: string | null;
  lastCreatedAt: string | null;
  minRewardTai: number;
  maxRewardTai: number;
  defaultRewardTai: number;
};

export type BetModalSnapshot = {
  marketId: string;
  marketTitle: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  currency: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type HttpMethod = 'GET' | 'POST';

type ApiOptions = {
  method?: HttpMethod;
  body?: unknown;
};

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // ignore parse errors and fall back to default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function withParams(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

function computeDaoPool(items: MarketCard[]): number {
  return items.reduce((sum, market) => sum + (market.pool || 0), 0);
}

export async function loadMarkets(filter: MarketFilter = 'all'): Promise<MarketCard[]> {
  const response = await apiFetch<{ items: MarketCard[] }>(`/markets${withParams({ filter })}`);
  return response.items;
}

export async function loadMarketFeed({ sort, cursor, limit, filter }: MarketFeedRequest): Promise<MarketFeedResponse> {
  const response = await apiFetch<{ items: MarketCard[]; nextCursor?: string }>(
    `/markets${withParams({ sort, cursor, limit, filter })}`,
  );

  return {
    items: response.items,
    nextCursor: response.nextCursor,
    daoPool: computeDaoPool(response.items),
  } satisfies MarketFeedResponse;
}

export async function loadMarketDetail(id: string): Promise<MarketCard> {
  const market = await apiFetch<MarketCard>(`/markets/${id}`);
  return market;
}

export async function loadMarketSnapshot(id: string): Promise<MarketSnapshot> {
  return apiFetch<MarketSnapshot>(`/markets/${id}/snapshot`);
}

export async function loadBetModalSnapshot(id: string): Promise<BetModalSnapshot> {
  const snapshot = await loadMarketSnapshot(id);
  const suggested = Math.max(25, Math.round(snapshot.pool * 0.05));

  return {
    marketId: snapshot.id,
    marketTitle: snapshot.title,
    amount: suggested,
    minAmount: 10,
    maxAmount: snapshot.targetPool,
    currency: 'TAI',
  } satisfies BetModalSnapshot;
}

export async function loadCreationPermission(walletAddress: string): Promise<MarketCreationPermission> {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  return apiFetch<MarketCreationPermission>(
    `/markets/creation/permission${withParams({ wallet: walletAddress })}`,
  );
}

export type CreateMarketPayload = {
  title: string;
  closesAt: string;
  minStake: number;
  maxStake: number;
  creatorWallet: string;
  rewardTai: number;
};

export async function createMarketDraft(payload: CreateMarketPayload): Promise<MarketCard> {
  return apiFetch<MarketCard>('/markets', {
    method: 'POST',
    body: payload,
  });
}

export const useMarketsQuery = (filter: MarketFilter = 'all'): UseQueryResult<MarketCard[]> =>
  useQuery({
    queryKey: ['markets', filter],
    queryFn: () => loadMarkets(filter),
  });

export const useMarketDetailQuery = (id: string) =>
  useQuery({
    queryKey: ['market', 'detail', id],
    queryFn: () => loadMarketDetail(id),
    enabled: Boolean(id),
  });

type PlaceBetVariables = {
  marketId: string;
  amount: number;
  side: 'yes' | 'no';
  walletAddress: string;
  note?: string;
  referrerWallet?: string;
  telegramId?: number;
  telegramUsername?: string;
};

type PlaceBetResponse = {
  success: boolean;
  market?: {
    id: string;
    pool: number;
    yesPool: number;
    noPool: number;
    yesOdds: number;
    noOdds: number;
    odds: string;
    volume: string;
    bountyMultiplier: number;
    participants?: number;
    liquidity?: string;
  };
};

export const usePlaceBetMutation = () => {
  const queryClient = useQueryClient();
  const mutationFn = useCallback(async (variables: PlaceBetVariables) => {
    return apiFetch<PlaceBetResponse>(`/markets/${variables.marketId}/bets`, {
      method: 'POST',
      body: {
        amount: variables.amount,
        side: variables.side,
        walletAddress: variables.walletAddress,
        note: variables.note,
        referrerWallet: variables.referrerWallet,
        telegramId: variables.telegramId,
        telegramUsername: variables.telegramUsername,
      },
    });
  }, []);

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          if (!Array.isArray(query.queryKey) || query.queryKey.length === 0) {
            return false;
          }
          const [root] = query.queryKey;
          if (root === 'markets') {
            return true;
          }
          if (root === 'home') {
            return true;
          }
          if (root === 'market') {
            return query.queryKey.includes(variables.marketId);
          }
          return false;
        },
      });
    },
  });
};
