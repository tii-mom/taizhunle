import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  type CommentSortKey,
  type CreateCommentPayload,
  type MarketComment,
  type LikeCommentResponse,
  likeMarketComment,
  loadMarketComments,
  postMarketComment,
} from '@/services/markets';
import { useTaiBalanceStore } from '@/store/taiBalanceStore';
import {
  createMockComment,
  getMockComments,
  likeMockComment as likeMockCommentFallback,
} from '@/components/market-detail/mockData';

const COMMENTS_KEY = (
  marketId: string,
  sort: CommentSortKey,
): ['market', 'comments', string, CommentSortKey] => ['market', 'comments', marketId, sort];

function flattenForBalances(comments: MarketComment[]): { wallet: string; balance: number }[] {
  const result: { wallet: string; balance: number }[] = [];

  const stack = [...comments];
  while (stack.length) {
    const comment = stack.pop();
    if (!comment) continue;
    result.push({ wallet: comment.walletAddress, balance: comment.taiBalance });
    if (comment.replies?.length) {
      stack.push(...comment.replies);
    }
  }

  return result;
}

function insertComment(comments: MarketComment[], incoming: MarketComment): MarketComment[] {
  if (!incoming.parentId) {
    return [incoming, ...comments];
  }

  return comments.map((comment) => {
    if (comment.id === incoming.parentId) {
      return {
        ...comment,
        replies: [incoming, ...(comment.replies ?? [])],
      } satisfies MarketComment;
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: insertComment(comment.replies, incoming),
      } satisfies MarketComment;
    }

    return comment;
  });
}

function replaceComment(
  comments: MarketComment[] | undefined,
  targetId: string | undefined,
  next: MarketComment,
): MarketComment[] | undefined {
  if (!comments?.length || !targetId) {
    return comments;
  }

  return comments.map((comment) => {
    if (comment.id === targetId) {
      return {
        ...next,
        replies: next.replies,
      } satisfies MarketComment;
    }

    if (comment.replies?.length) {
      const updatedReplies = replaceComment(comment.replies, targetId, next);
      if (updatedReplies !== comment.replies) {
        return {
          ...comment,
          replies: updatedReplies ?? [],
        } satisfies MarketComment;
      }
    }

    return comment;
  });
}

function updateComment(
  comments: MarketComment[] | undefined,
  targetId: string,
  updater: (comment: MarketComment) => MarketComment,
): MarketComment[] | undefined {
  if (!comments?.length) {
    return comments;
  }

  let changed = false;

  const mapped = comments.map((comment) => {
    if (comment.id === targetId) {
      changed = true;
      return updater(comment);
    }

    if (comment.replies?.length) {
      const updatedReplies = updateComment(comment.replies, targetId, updater);
      if (updatedReplies !== comment.replies) {
        changed = true;
        return {
          ...comment,
          replies: updatedReplies ?? [],
        } satisfies MarketComment;
      }
    }

    return comment;
  });

  return changed ? mapped : comments;
}

type MarketCommentsQueryOptions = Pick<UseQueryOptions<MarketComment[], Error>, 'enabled' | 'staleTime'>;

type SendCommentVariables = CreateCommentPayload & {
  walletAddress: string;
  nickname: string;
  avatar: string | null;
  taiBalance: number;
};

type LikeCommentVariables = {
  commentId: string;
};

type CommentMutationContext = {
  previous: MarketComment[];
  optimisticId: string;
};

type LikeMutationContext = {
  previous: MarketComment[];
};

type LikeSuccessPayload = {
  commentId: string;
  response: LikeCommentResponse;
};

type UseMarketCommentsResult = UseQueryResult<MarketComment[]> & {
  comments: MarketComment[];
  sendComment: UseMutationResult<MarketComment, Error, SendCommentVariables, CommentMutationContext>;
  likeComment: UseMutationResult<LikeSuccessPayload, Error, LikeCommentVariables, LikeMutationContext>;
};

export function useMarketComments(
  marketId: string,
  sort: CommentSortKey,
  options?: MarketCommentsQueryOptions,
): UseMarketCommentsResult {
  const queryClient = useQueryClient();
  const bulkUpsert = useTaiBalanceStore((state) => state.bulkUpsert);
  const setBalance = useTaiBalanceStore((state) => state.setBalance);

  const enabled = Boolean(marketId) && (options?.enabled ?? true);
  const queryKey = useMemo(() => COMMENTS_KEY(marketId, sort), [marketId, sort]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const comments = await loadMarketComments(marketId, sort);
        if (comments.length) {
          bulkUpsert(flattenForBalances(comments));
          return comments;
        }
      } catch (error) {
        console.warn('[useMarketComments] fallback to mock comments', error);
      }

      const mock = getMockComments(marketId, sort);
      bulkUpsert(flattenForBalances(mock));
      return mock;
    },
    enabled,
    staleTime: options?.staleTime ?? 45_000,
  });

  const sendComment = useMutation<MarketComment, Error, SendCommentVariables, CommentMutationContext>({
    mutationFn: async (variables: SendCommentVariables) => {
      try {
        return await postMarketComment(marketId, {
          body: variables.body,
          parentId: variables.parentId ?? null,
        });
      } catch (error) {
        console.warn('[useMarketComments] post fallback', error);
        return createMockComment(marketId, {
          body: variables.body,
          parentId: variables.parentId ?? null,
          walletAddress: variables.walletAddress,
          nickname: variables.nickname,
          avatar: variables.avatar,
          taiBalance: variables.taiBalance,
        });
      }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MarketComment[]>(queryKey) ?? [];
      const optimisticId = `optimistic-${Date.now()}`;

      const optimisticComment: MarketComment = {
        id: optimisticId,
        parentId: variables.parentId ?? null,
        body: variables.body,
        likes: 0,
        createdAt: new Date().toISOString(),
        walletAddress: variables.walletAddress,
        nickname: variables.nickname,
        avatar: variables.avatar,
        taiBalance: variables.taiBalance,
        replies: [],
        viewerHasLiked: false,
      } satisfies MarketComment;

      const nextSnapshot = insertComment(previous, optimisticComment);
      queryClient.setQueryData(queryKey, nextSnapshot);

      return { previous, optimisticId };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
      if (typeof window !== 'undefined') {
        window.alert?.('评论发送失败，请稍后重试。');
      }
    },
    onSuccess: (comment, _variables, context) => {
      setBalance({ wallet: comment.walletAddress, balance: comment.taiBalance });
      queryClient.setQueryData(queryKey, (current: MarketComment[] | undefined) => {
        if (!current) return current;
        const replaced = replaceComment(current, context.optimisticId, comment);
        return replaced ?? current;
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const likeComment = useMutation<LikeSuccessPayload, Error, LikeCommentVariables, LikeMutationContext>({
    mutationFn: async ({ commentId }: LikeCommentVariables) => {
      try {
        const response = await likeMarketComment(commentId);
        return { commentId, response } as const;
      } catch (error) {
        console.warn('[useMarketComments] like fallback', error);
        return { commentId, response: likeMockCommentFallback(marketId, commentId) } as const;
      }
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MarketComment[]>(queryKey) ?? [];

      queryClient.setQueryData(queryKey, (current: MarketComment[] | undefined) =>
        updateComment(current, commentId, (comment) => ({
          ...comment,
          likes: comment.likes + 1,
          viewerHasLiked: true,
        })),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
      if (typeof window !== 'undefined') {
        window.alert?.('点赞失败，请稍后重试。');
      }
    },
    onSuccess: ({ commentId, response }) => {
      queryClient.setQueryData(queryKey, (current: MarketComment[] | undefined) =>
        updateComment(current, commentId, (comment) => ({
          ...comment,
          likes: response.likes ?? comment.likes,
          viewerHasLiked: response.viewer_liked ?? true,
        })),
      );
    },
  });

  return {
    ...query,
    comments: query.data ?? [],
    sendComment,
    likeComment,
  } satisfies UseMarketCommentsResult;
}
