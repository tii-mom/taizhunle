import type {
  CommentSortKey,
  CreateCommentPayload,
  LikeCommentResponse,
  MarketComment,
  MarketOddsSeriesPoint,
} from '@/services/markets';

const mockOddsStore = new Map<string, MarketOddsSeriesPoint[]>();
const mockCommentsStore = new Map<string, MarketComment[]>();
let mockAlertShown = false;

function maybeNotifyMock() {
  if (mockAlertShown) return;
  mockAlertShown = true;
  if (typeof window !== 'undefined') {
    window.alert?.('当前展示模拟数据，后端接口接入完成后将切换为实时数据。');
  }
}

function random(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateMockOddsSeries(marketId: string): MarketOddsSeriesPoint[] {
  const cached = mockOddsStore.get(marketId);
  if (cached?.length) {
    return cached;
  }

  const generator = random(marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || Date.now());
  const now = Date.now();
  const points: MarketOddsSeriesPoint[] = [];
  let yes = 0.52 + generator() * 0.06;
  let no = 1 - yes;

  for (let index = 60; index >= 0; index -= 1) {
    const delta = (generator() - 0.5) * 0.08;
    yes = Math.min(0.95, Math.max(0.05, yes + delta));
    no = Math.min(0.95, Math.max(0.05, 1 - yes + (generator() - 0.5) * 0.02));
    points.push({
      timestamp: now - index * 60_000,
      yesOdds: Number(yes.toFixed(4)),
      noOdds: Number(no.toFixed(4)),
      volume: Math.round(800 + generator() * 400),
    });
  }

  mockOddsStore.set(marketId, points);
  maybeNotifyMock();
  return points;
}

function deepCloneComments(comments: MarketComment[]): MarketComment[] {
  return comments.map((comment) => ({
    ...comment,
    replies: comment.replies ? deepCloneComments(comment.replies) : [],
  }));
}

function ensureMockComments(marketId: string): MarketComment[] {
  const existing = mockCommentsStore.get(marketId);
  if (existing) {
    return existing;
  }

  const baseTime = Date.now();
  const seed = random(baseTime + marketId.length);

  const comments: MarketComment[] = [
    {
      id: `mock-${marketId}-1`,
      parentId: null,
      body: 'YES 赔率看起来还有上涨空间，短线冲刺概率挺高。',
      likes: 18,
      createdAt: new Date(baseTime - 15 * 60_000).toISOString(),
      walletAddress: 'EQCDEMOYESMOCK000000000000000000000000000000000',
      nickname: 'AlphaVoir',
      avatar: '/logo.svg',
      taiBalance: 1842 + Math.round(seed() * 1200),
      replies: [
        {
          id: `mock-${marketId}-1-1`,
          parentId: `mock-${marketId}-1`,
          body: '注意裁决团投票，最近几个类似赛道都翻车。',
          likes: 6,
          createdAt: new Date(baseTime - 12 * 60_000).toISOString(),
          walletAddress: 'EQCDEMOCAUTION0000000000000000000000000000000',
          nickname: 'BetaWatch',
          avatar: '/logo.svg',
          taiBalance: 902 + Math.round(seed() * 400),
          replies: [
            {
              id: `mock-${marketId}-1-1-1`,
              parentId: `mock-${marketId}-1-1`,
              body: '@AlphaVoir 我跟进了官方资讯，裁决团倾向 YES。',
              likes: 4,
              createdAt: new Date(baseTime - 9 * 60_000).toISOString(),
              walletAddress: 'EQCDEMODEEPTHREAD00000000000000000000000000',
              nickname: 'GammaJudge',
              avatar: '/logo.svg',
              taiBalance: 1580 + Math.round(seed() * 500),
              replies: [],
              viewerHasLiked: false,
            },
          ],
          viewerHasLiked: false,
        },
      ],
      viewerHasLiked: false,
    },
    {
      id: `mock-${marketId}-2`,
      parentId: null,
      body: 'NO 的赔率有点低估，感觉风险回报比更好。',
      likes: 9,
      createdAt: new Date(baseTime - 35 * 60_000).toISOString(),
      walletAddress: 'EQCDEMOCONTRA00000000000000000000000000000000',
      nickname: 'DeltaContrarian',
      avatar: '/logo.svg',
      taiBalance: 1260 + Math.round(seed() * 600),
      replies: [],
      viewerHasLiked: false,
    },
  ];

  mockCommentsStore.set(marketId, comments);
  maybeNotifyMock();
  return comments;
}

export function getMockComments(marketId: string, _sort: CommentSortKey): MarketComment[] {
  return deepCloneComments(ensureMockComments(marketId));
}

export function createMockComment(
  marketId: string,
  payload: CreateCommentPayload & { walletAddress: string; nickname: string; avatar: string | null; taiBalance: number },
): MarketComment {
  const source = ensureMockComments(marketId);
  const id = `mock-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const comment: MarketComment = {
    id,
    parentId: payload.parentId ?? null,
    body: payload.body,
    likes: 0,
    createdAt: new Date().toISOString(),
    walletAddress: payload.walletAddress,
    nickname: payload.nickname,
    avatar: payload.avatar,
    taiBalance: payload.taiBalance,
    replies: [],
    viewerHasLiked: true,
  };

  if (!comment.parentId) {
    source.unshift(comment);
  } else {
    insertIntoThread(source, comment.parentId, comment);
  }

  maybeNotifyMock();
  return { ...comment, replies: [] };
}

function insertIntoThread(thread: MarketComment[], parentId: string, comment: MarketComment): boolean {
  for (const item of thread) {
    if (item.id === parentId) {
      item.replies = [comment, ...(item.replies ?? [])];
      return true;
    }
    if (item.replies?.length) {
      const inserted = insertIntoThread(item.replies, parentId, comment);
      if (inserted) return true;
    }
  }
  return false;
}

export function likeMockComment(marketId: string, commentId: string): LikeCommentResponse {
  const source = ensureMockComments(marketId);
  const stack = [...source];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    if (current.id === commentId) {
      current.likes += 1;
      current.viewerHasLiked = true;
      maybeNotifyMock();
      return { likes: current.likes, viewer_liked: true };
    }
    if (current.replies?.length) {
      stack.push(...current.replies);
    }
  }
  return { likes: 1, viewer_liked: true };
}
