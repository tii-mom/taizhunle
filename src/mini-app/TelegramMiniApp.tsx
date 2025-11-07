import { useMemo, useState } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

function useMiniAppParams() {
  if (typeof window === 'undefined') {
    return { marketId: null, selection: null, amount: 0.1, crowdCode: null } as const;
  }
  const params = new URLSearchParams(window.location.search);
  const marketId = params.get('marketId');
  const selection = params.get('selection');
  const crowdCode = params.get('crowd');
  const amount = Number(params.get('amount') ?? '0.1');
  return { marketId, selection, amount: Number.isFinite(amount) && amount > 0 ? amount : 0.1, crowdCode } as const;
}

export function TelegramMiniApp() {
  const { marketId, selection, amount, crowdCode } = useMiniAppParams();
  const wallet = useTonWallet();
  const [betId, setBetId] = useState<string | null>(null);
  const telegram = useMemo(() => (typeof window === 'undefined' ? null : window.Telegram?.WebApp) ?? null, []);

  const { status, error, user, openTelegramShare } = useTelegramWebApp({
    amountTai: amount,
    marketId,
    selection,
    crowdCode,
    onBetSuccess: newBetId => setBetId(newBetId),
  });

  const statusText = useMemo(() => {
    switch (status) {
      case 'authorizing':
        return '正在校验 Telegram 签名…';
      case 'processing':
        return '提交交易中…';
      case 'success':
        return '下注完成！';
      case 'error':
        return error ?? '发生错误';
      default:
        return wallet?.account ? '点击底部主按钮完成下注' : '请连接 TON Space 钱包';
    }
  }, [error, status, wallet?.account]);

  return (
    <div className="min-h-screen bg-[#0f111b] text-white">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8">
        <header className="space-y-1 text-center">
          <p className="text-sm text-white/60">太准了 · 一键预测</p>
          <h1 className="text-2xl font-semibold">{selection ? '确认你的选择' : '快速下注'}</h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>Telegram</span>
            <span>{user?.username ? `@${user.username}` : user?.first_name ?? '未登录'}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/40">预测场次</p>
              <p className="truncate text-sm font-medium">{marketId ?? '未指定'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/40">选择</p>
              <p className="text-sm font-medium">{selection ?? '待选择'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/40">下注金额</p>
              <p className="text-sm font-semibold text-emerald-300">{amount.toFixed(2)} TAI</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/40">钱包地址</p>
              <p className="truncate text-xs">{wallet?.account?.address ?? '待连接'}</p>
            </div>
          </div>
        </section>

        <TonConnectButton />

        <section className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
          <p>{statusText}</p>
          {status === 'error' && error ? <p className="mt-2 text-red-300">{error}</p> : null}
        </section>

        {status === 'success' && betId ? (
          <button
            type="button"
            className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black shadow-lg shadow-emerald-500/40"
            onClick={() => {
              if (!telegram) {
                return;
              }
              const shareUrl = new URL(window.location.href);
              shareUrl.searchParams.set('ref', String(user?.id ?? '')); 
              openTelegramShare(shareUrl.toString(), '帮我补上最后一单，红包福利等你⚡️');
            }}
          >
            分享红包链接
          </button>
        ) : null}
      </div>
    </div>
  );
}
