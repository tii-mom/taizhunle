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
  creatorStakeTai: number;
  stakeCooldownHours: number;
  juryCount: number;
  followers: string[];
  isFavorite?: boolean;
  liquidity?: string;
  participants?: number;
  jurorRewardTai?: number;
  topicTags?: string[];
  tags?: string[];
  referenceUrl?: string | null;
  referenceSummary?: string | null;
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
  requiredStakeTai: number;
  stakeCooldownHours: number;
  maxStakeTai: number;
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
  creatorStakeTai: number;
  tags?: string[];
  topicTags?: string[];
  referenceUrl?: string | null;
  referenceSummary?: string | null;
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
    creatorStakeTai: number;
    jurorRewardTai?: number;
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

export type MarketOddsSeriesPoint = {
  timestamp: number;
  yesOdds: number;
  noOdds: number;
  volume: number;
};

type RawMarketOddsPoint = {
  ts: string | number;
  yes_odds: number;
  no_odds: number;
  volume: number;
};

function mapOddsPoint(point: RawMarketOddsPoint): MarketOddsSeriesPoint {
  const timestamp = typeof point.ts === 'number' ? point.ts : Date.parse(point.ts);
  return {
    timestamp,
    yesOdds: point.yes_odds,
    noOdds: point.no_odds,
    volume: point.volume,
  } satisfies MarketOddsSeriesPoint;
}

export async function loadMarketOddsSeries(
  id: string,
  granularity: '1m' | '5m' | '15m' = '1m',
): Promise<MarketOddsSeriesPoint[]> {
  const response = await apiFetch<RawMarketOddsPoint[]>(`/markets/${id}/odds-series${withParams({ granularity })}`);
  return response.map(mapOddsPoint);
}

export type MarketComment = {
  id: string;
  parentId: string | null;
  body: string;
  likes: number;
  createdAt: string;
  walletAddress: string;
  nickname: string;
  avatar: string | null;
  taiBalance: number;
  replies: MarketComment[];
  viewerHasLiked: boolean;
};

type RawMarketComment = {
  id: string;
  parent_id: string | null;
  body: string;
  likes: number;
  created_at: string;
  wallet_address: string;
  nickname: string;
  avatar: string | null;
  tai_balance: number;
  replies?: RawMarketComment[];
  viewer_liked?: boolean;
};

function mapMarketComment(comment: RawMarketComment): MarketComment {
  return {
    id: comment.id,
    parentId: comment.parent_id,
    body: comment.body,
    likes: comment.likes,
    createdAt: comment.created_at,
    walletAddress: comment.wallet_address,
    nickname: comment.nickname,
    avatar: comment.avatar,
    taiBalance: comment.tai_balance,
    replies: (comment.replies ?? []).map(mapMarketComment),
    viewerHasLiked: Boolean(comment.viewer_liked),
  } satisfies MarketComment;
}

export type CommentSortKey = 'hot' | 'time';

export async function loadMarketComments(
  marketId: string,
  sort: CommentSortKey,
): Promise<MarketComment[]> {
  const response = await apiFetch<RawMarketComment[]>(
    `/markets/${marketId}/comments${withParams({ sort })}`,
  );
  return response.map(mapMarketComment);
}

export type CreateCommentPayload = {
  body: string;
  parentId?: string | null;
};

export async function postMarketComment(
  marketId: string,
  payload: CreateCommentPayload,
): Promise<MarketComment> {
  const response = await apiFetch<RawMarketComment>(`/markets/${marketId}/comments`, {
    method: 'POST',
    body: {
      body: payload.body,
      parentId: payload.parentId ?? null,
    },
  });
  return mapMarketComment(response);
}

export type LikeCommentResponse = {
  likes: number;
  viewer_liked?: boolean;
};

export async function likeMarketComment(commentId: string): Promise<LikeCommentResponse> {
  return apiFetch<LikeCommentResponse>(`/comments/${commentId}/like`, {
    method: 'POST',
  });
}
