import { useCallback, useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

import { usePlaceBetMutation } from '@/services/markets';

type ExecuteBetParams = {
  marketId: string;
  amount: number;
  side: 'yes' | 'no';
  note?: string;
};

const REFERRER_STORAGE_KEY = 'taizhunle:referrerWallet';

export function useBetExecutor() {
  const wallet = useTonWallet();
  const mutation = usePlaceBetMutation();
  const mockEnabled = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
  const fallbackWallet = useMemo(() => {
    if (wallet?.account?.address) {
      return wallet.account.address;
    }

    const explicit = import.meta.env.VITE_DEV_WALLET_ADDRESS;
    if (explicit && explicit.trim().length > 0) {
      return explicit.trim();
    }

    if (mockEnabled) {
      return 'EQD_mock_wallet_address_for_dev_mode';
    }

    return undefined;
  }, [wallet?.account?.address, mockEnabled]);

  const execute = useCallback(
    async ({ marketId, amount, side, note }: ExecuteBetParams) => {
      const walletAddress = fallbackWallet;
      if (!walletAddress) {
        throw new Error('请先连接 TON 钱包后再下注');
      }

      const referrerWallet = localStorage.getItem(REFERRER_STORAGE_KEY) ?? undefined;

      await mutation.mutateAsync({
        marketId,
        amount,
        side,
        walletAddress,
        note,
        referrerWallet,
      });
    },
    [fallbackWallet, mutation],
  );

  return {
    execute,
    isPending: mutation.isPending,
  } as const;
}

export function getStoredReferrerWallet(): string | null {
  return localStorage.getItem(REFERRER_STORAGE_KEY);
}

export function setStoredReferrerWallet(value: string) {
  localStorage.setItem(REFERRER_STORAGE_KEY, value);
}
