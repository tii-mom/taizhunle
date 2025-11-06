import { useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import clsx from 'clsx';

import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButtonGlass } from '@/components/glass/GlassButtonGlass';
import { useMarketComments } from '@/hooks/useMarketComments';
import { useTaiBalance } from '@/store/taiBalanceStore';
import type { MarketComment } from '@/services/markets';
import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/hooks/useI18n';

const SORT_OPTIONS: Array<{ label: string; value: 'hot' | 'time' }> = [
  { label: '按热度', value: 'hot' },
  { label: '按时间', value: 'time' },
];

type CommentsCardProps = {
  marketId: string;
};

type CommentItemProps = {
  comment: MarketComment;
  depth?: number;
  onReply: (comment: MarketComment) => void;
  onLike: (commentId: string) => void;
  likeBusyId?: string | null;
  locale: string;
  isExpanded?: boolean;
  onToggleReplies?: (comment: MarketComment) => void;
};

type ReplyDraft = {
  parentId: string | null;
  nickname?: string;
};

function shorten(wallet: string): string {
  if (!wallet) return '';
  return wallet.length <= 12 ? wallet : `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

function resolveWalletMeta(wallet: unknown): { avatar?: string; name?: string } {
  if (!wallet) return {};
  const candidate = wallet as {
    imageUrl?: string;
    device?: { appImageUrl?: string; imageUrl?: string; appName?: string };
  };

  return {
    avatar: candidate.device?.appImageUrl ?? candidate.device?.imageUrl ?? candidate.imageUrl,
    name: candidate.device?.appName,
  };
}

function formatRelativeTime(timestamp: string, locale: string): string {
  const date = new Date(timestamp);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { numeric: 'auto' });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, 'second');
  }
  if (absSeconds < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), 'minute');
  }
  if (absSeconds < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  }
  return formatter.format(Math.round(diffSeconds / 86400), 'day');
}

function CommentMeta({
  wallet,
  nickname,
  timestamp,
  locale,
}: {
  wallet: string;
  nickname: string;
  timestamp: string;
  locale: string;
}) {
  const taiBalance = useTaiBalance(wallet) ?? 0;
  const { mode } = useTheme();
  const tone = mode === 'light' ? 'text-slate-500' : 'text-white/60';
  const subtitleTone = mode === 'light' ? 'text-slate-400' : 'text-white/40';

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={clsx('font-semibold text-white', mode === 'light' && 'text-slate-900')}>{nickname}</span>
      <span className={clsx('rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono', tone)}>
        {shorten(wallet)}
      </span>
      <span className={clsx('rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono', tone)}>
        {taiBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} TAI
      </span>
      <span className={clsx(subtitleTone)}>{formatRelativeTime(timestamp, locale)}</span>
    </div>
  );
}

function CommentBubble({
  comment,
  depth = 0,
  onReply,
  onLike,
  likeBusyId,
  locale,
  isExpanded = false,
  onToggleReplies,
}: CommentItemProps) {
  const { mode } = useTheme();
  const isNested = depth > 0;
  const canReply = depth < 1;
  const isLikable = !comment.viewerHasLiked;
  const likeDisabled = !isLikable || likeBusyId === comment.id;
  const hasReplies = Boolean(comment.replies?.length);
  const renderRepliesInline = isNested || isExpanded;

  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/12 bg-white/6 p-4 shadow-[0_18px_38px_-32px_rgba(15,23,42,0.55)] backdrop-blur-lg transition',
        isNested && 'ml-10 mt-3 border-white/10 bg-white/4',
        mode === 'light' && 'border-slate-200 bg-white/80 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.25)]',
      )}
    >
      <div className="flex gap-3">
        <img
          src={comment.avatar ?? '/logo.svg'}
          alt={comment.nickname}
          className="h-10 w-10 flex-shrink-0 rounded-full border border-white/20 object-cover"
        />
        <div className="flex-1 space-y-3">
          <CommentMeta
            wallet={comment.walletAddress}
            nickname={comment.nickname}
            timestamp={comment.createdAt}
            locale={locale}
          />
          <p className={clsx('text-sm leading-relaxed text-white/90', mode === 'light' && 'text-slate-700')}>
            {comment.body}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <button
              type="button"
              className={clsx(
                'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:text-white',
                mode === 'light' && 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white',
                likeDisabled && 'cursor-not-allowed opacity-60 hover:text-inherit',
              )}
              onClick={() => {
                if (likeDisabled) return;
                onLike(comment.id);
              }}
              disabled={likeDisabled}
            >
              👍
              <span className="font-mono">{comment.likes}</span>
            </button>
            {canReply ? (
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:text-white"
                onClick={() => onReply(comment)}
              >
                回复
              </button>
            ) : null}
          </div>
          {renderRepliesInline && hasReplies ? (
            <div className="space-y-3">
              {comment.replies?.map((reply) => (
                <CommentBubble
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onReply={onReply}
                  onLike={onLike}
                  likeBusyId={likeBusyId}
                  locale={locale}
                  isExpanded
                  onToggleReplies={onToggleReplies}
                />
              ))}
            </div>
          ) : null}
          {!renderRepliesInline && hasReplies ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
              onClick={() => onToggleReplies?.(comment)}
            >
              查看 {comment.replies?.length ?? 0} 条回复
            </button>
          ) : null}
          {renderRepliesInline && hasReplies && !isNested ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
              onClick={() => onToggleReplies?.(comment)}
            >
              收起回复
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl animate-pulse"
        />
      ))}
    </div>
  );
}

export function CommentsCard({ marketId }: CommentsCardProps) {
  const [sort, setSort] = useState<'hot' | 'time'>('hot');
  const [draft, setDraft] = useState('');
  const [replyDraft, setReplyDraft] = useState<ReplyDraft>({ parentId: null });
  const wallet = useTonWallet();
  const { mode } = useTheme();
  const { locale } = useI18n(['detail']);
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  const { comments, isPending, isFetching, isError, refetch, sendComment, likeComment } = useMarketComments(
    marketId,
    sort,
  );

  const walletAddress = wallet?.account?.address ?? '';
  const isConnected = Boolean(walletAddress);
  const { avatar: walletAvatar, name: walletName } = resolveWalletMeta(wallet);
  const userNickname = walletName ?? shorten(walletAddress);
  const userAvatar = walletAvatar ?? '/logo.svg';
  const userBalance = useTaiBalance(walletAddress) ?? 0;

  const submitting = sendComment.isPending;
  const sendDisabled = !isConnected || !draft.trim() || submitting;

  const handleSubmit = () => {
    if (sendDisabled) return;

    sendComment.mutate(
      {
        body: draft.trim(),
        parentId: replyDraft.parentId,
        walletAddress,
        nickname: userNickname,
        avatar: userAvatar,
        taiBalance: userBalance,
      },
      {
        onSuccess: () => {
          setDraft('');
          setReplyDraft({ parentId: null });
        },
      },
    );
  };

  const handleToggleReplies = (target: MarketComment) => {
    setExpandedThreads((prev) => {
      const next = { ...prev };
      if (next[target.id]) {
        delete next[target.id];
      } else {
        next[target.id] = true;
      }
      return next;
    });
  };

  const headerTone = mode === 'light' ? 'text-slate-900' : 'text-white';
  const subTone = mode === 'light' ? 'text-slate-500' : 'text-white/60';

  const handleLike = (commentId: string) => {
    if (likeBusyId && likeBusyId !== commentId) {
      return;
    }

    setLikeBusyId(commentId);
    likeComment.mutate(
      { commentId },
      {
        onSettled: () => {
          setLikeBusyId(null);
        },
      },
    );
  };

  return (
    <GlassCard className="space-y-6 border border-white/20 bg-white/10 p-6 backdrop-blur-2xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className={clsx('text-lg font-semibold', headerTone)}>社区讨论</h3>
          <p className={clsx('text-xs uppercase tracking-[0.3em]', subTone)}>分享洞察与新鲜观点</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 text-xs backdrop-blur">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value)}
              className={clsx(
                'rounded-full px-3 py-1 font-semibold transition',
                sort === option.value
                  ? 'bg-white/80 text-slate-900 shadow-md'
                  : 'text-white/70 hover:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <img
            src={userAvatar}
            alt={userNickname}
            className="h-11 w-11 rounded-full border border-white/20 object-cover"
          />
          <div className="flex-1 space-y-3">
            {replyDraft.parentId ? (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                <span>
                  回复 @
                  <span className="font-semibold">{replyDraft.nickname ?? '匿名'}</span>
                </span>
                <button type="button" className="text-white/50 hover:text-white" onClick={() => setReplyDraft({ parentId: null })}>
                  取消
                </button>
              </div>
            ) : null}
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={isConnected ? '输入你的观点…' : '请先连接钱包后发表评论'}
              disabled={!isConnected || submitting}
              className={clsx(
                'glass-textarea min-h-[120px] resize-y text-sm leading-relaxed text-white/90 placeholder:text-white/40',
                mode === 'light' && 'text-slate-700 placeholder:text-slate-400',
              )}
            />
          </div>
          <GlassButtonGlass onClick={handleSubmit} disabled={sendDisabled}>
            发送
          </GlassButtonGlass>
        </div>
      </section>

      <section className="space-y-4">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-white/70">
            <span>评论加载失败，请稍后重试</span>
            <GlassButtonGlass variant="secondary" onClick={() => refetch()}>
              重新加载
            </GlassButtonGlass>
          </div>
        ) : isPending ? (
          <CommentsSkeleton />
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
            暂无评论，快来抢沙发！
          </div>
        ) : (
          <div className={clsx('space-y-4', isFetching ? 'opacity-90' : '')}>
            {comments.map((comment) => (
              <CommentBubble
                key={comment.id}
                comment={comment}
                depth={0}
                onReply={(item) => setReplyDraft({ parentId: item.id, nickname: item.nickname })}
                onLike={(commentId) => {
                  if (comment.viewerHasLiked) return;
                  handleLike(commentId);
                }}
                likeBusyId={likeBusyId}
                locale={locale}
                isExpanded={Boolean(expandedThreads[comment.id])}
                onToggleReplies={(thread) => handleToggleReplies(thread)}
              />
            ))}
          </div>
        )}
      </section>
    </GlassCard>
  );
}
