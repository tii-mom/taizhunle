import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

interface UseTelegramWebAppOptions {
  amountTai: number;
  marketId: string | null;
  selection: string | null;
  crowdCode?: string | null;
  onBetSuccess?: (betId: string, tx: string | null) => void;
}

interface HookState {
  status: 'idle' | 'authorizing' | 'ready' | 'processing' | 'success' | 'error';
  error: string | null;
  sessionToken: string | null;
}

function toNano(amountTai: number): string {
  return Math.round(amountTai * 1_000_000_000).toString();
}

function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.Telegram?.WebApp ?? null;
}

export function useTelegramWebApp(options: UseTelegramWebAppOptions) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [state, setState] = useState<HookState>({ status: 'idle', error: null, sessionToken: null });
  const onBetSuccessRef = useRef(options.onBetSuccess);
  const mainButtonHandlerRef = useRef<(() => void) | null>(null);

  const telegram = useMemo(() => getTelegramWebApp(), []);
  const user = telegram?.initDataUnsafe.user;
  const initData = telegram?.initData ?? '';
  const amountDisplay = `${options.amountTai.toFixed(2)} TAI`;
  const amountNano = useMemo(() => toNano(options.amountTai), [options.amountTai]);
  const contractAddress = useMemo(() => import.meta.env.VITE_PREDICTION_CONTRACT as string | undefined, []);

  useEffect(() => {
    onBetSuccessRef.current = options.onBetSuccess;
  }, [options.onBetSuccess]);

  useEffect(() => {
    if (!telegram) {
      return;
    }
    telegram.ready();
    telegram.expand?.();
    telegram.MainButton.show();
    telegram.MainButton.setText(`点击预测（${amountDisplay}）`);
  }, [telegram, amountDisplay]);

  const ensureAuthorization = useCallback(async () => {
    if (!wallet?.account?.address || !initData) {
      return null;
    }
    if (state.sessionToken) {
      return state.sessionToken;
    }

    setState(prev => ({ ...prev, status: 'authorizing', error: null }));

    const response = await fetch('/api/auth/implicit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        initData,
        wallet: wallet.account.address,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      setState({ status: 'error', error: message || '隐式登录失败', sessionToken: null });
      return null;
    }

    const result = (await response.json()) as { jwt: string };
    setState({ status: 'ready', error: null, sessionToken: result.jwt });
    return result.jwt;
  }, [initData, state.sessionToken, wallet?.account?.address]);

  useEffect(() => {
    if (!wallet?.account?.address) {
      return;
    }
    // Trigger implicit auth eagerly to speed up one-click flow
    ensureAuthorization().catch(error => {
      console.error('Implicit auth failed', error);
    });
  }, [ensureAuthorization, wallet?.account?.address]);

  const handleBet = useCallback(async () => {
    if (!telegram) {
      setState(prev => ({ ...prev, status: 'error', error: 'Telegram WebApp 未初始化' }));
      return;
    }
    if (!tonConnectUI) {
      setState(prev => ({ ...prev, status: 'error', error: 'TonConnect 未就绪' }));
      return;
    }
    if (!contractAddress) {
      setState(prev => ({ ...prev, status: 'error', error: '缺少预测合约地址配置' }));
      return;
    }
    if (!options.marketId || !options.selection) {
      setState(prev => ({ ...prev, status: 'error', error: '缺少预测场次或选项' }));
      return;
    }

    telegram.MainButton.showProgress?.();
    setState(prev => ({ ...prev, status: 'processing', error: null }));

    try {
      if (!wallet?.account?.address) {
        await tonConnectUI.openModal();
        telegram.MainButton.hideProgress?.();
        setState(prev => ({ ...prev, status: 'idle', error: null }));
        return;
      }

      const token = await ensureAuthorization();
      if (!token) {
        throw new Error('隐式授权失败');
      }

      const validUntil = Math.floor(Date.now() / 1000) + 60;
      const txRequest: SendTransactionRequest = {
        validUntil,
        messages: [
          {
            address: contractAddress,
            amount: amountNano,
          },
        ],
      };

      const txResponse = await tonConnectUI.sendTransaction(txRequest);

      const body = {
        initData,
        wallet: wallet.account.address,
        tx: txResponse.boc ?? null,
        marketId: options.marketId,
        selection: options.selection,
        amountTai: options.amountTai,
        crowdCode: options.crowdCode ?? null,
      };

      const betResponse = await fetch('/api/bet/oneclick', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!betResponse.ok) {
        const message = await betResponse.text();
        throw new Error(message || '下注失败');
      }

      const betResult = (await betResponse.json()) as { betId: string; crowdUrl?: string };
      setState(prev => ({ ...prev, status: 'success', error: null }));

      const payload = {
        event: 'bet-confirmed',
        betId: betResult.betId,
        amount: options.amountTai,
        crowdUrl: betResult.crowdUrl,
      };
      telegram.sendData(JSON.stringify(payload));
      onBetSuccessRef.current?.(betResult.betId, txResponse.boc ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '下注失败';
      setState({ status: 'error', error: message, sessionToken: state.sessionToken });
    } finally {
      telegram.MainButton.hideProgress?.();
    }
  }, [
    amountNano,
    contractAddress,
    ensureAuthorization,
    initData,
    options.amountTai,
    options.crowdCode,
    options.marketId,
    options.selection,
    state.sessionToken,
    telegram,
    tonConnectUI,
    wallet?.account?.address,
  ]);

  useEffect(() => {
    if (!telegram) {
      return () => {};
    }

    if (mainButtonHandlerRef.current) {
      telegram.MainButton.offClick(mainButtonHandlerRef.current);
    }

    telegram.MainButton.setText(`点击预测（${amountDisplay}）`);
    mainButtonHandlerRef.current = handleBet;
    telegram.MainButton.onClick(handleBet);

    return () => {
      if (mainButtonHandlerRef.current) {
        telegram.MainButton.offClick(mainButtonHandlerRef.current);
      }
    };
  }, [amountDisplay, handleBet, telegram]);

  return {
    status: state.status,
    error: state.error,
    user,
    sessionToken: state.sessionToken,
    openTelegramShare: (url: string, text: string) => {
      const shareUrl = new URL('https://t.me/share/url');
      shareUrl.searchParams.set('url', url);
      shareUrl.searchParams.set('text', text);
      window.open(shareUrl.toString(), '_blank');
    },
  } as const;
}
