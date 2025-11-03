import { useCallback } from 'react';
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

  const execute = useCallback(
    async ({ marketId, amount, side, note }: ExecuteBetParams) => {
      const walletAddress = wallet?.account?.address;
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
    [mutation, wallet?.account?.address],
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
