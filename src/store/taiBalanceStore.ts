import { create } from 'zustand';

export type TaiBalanceEntry = {
  wallet: string;
  balance: number;
};

type TaiBalanceState = {
  balances: Record<string, number>;
  setBalance: (entry: TaiBalanceEntry) => void;
  bulkUpsert: (entries: TaiBalanceEntry[]) => void;
};

function normalizeWallet(wallet: string): string {
  return wallet?.toLowerCase() ?? '';
}

export const useTaiBalanceStore = create<TaiBalanceState>((set) => ({
  balances: {},
  setBalance: (entry) =>
    set((state) => {
      const key = normalizeWallet(entry.wallet);
      if (!key) return state;
      if (state.balances[key] === entry.balance) {
        return state;
      }
      return {
        balances: {
          ...state.balances,
          [key]: entry.balance,
        },
      };
    }),
  bulkUpsert: (entries) =>
    set((state) => {
      if (!entries.length) {
        return state;
      }

      let changed = false;
      const nextBalances = { ...state.balances };

      entries.forEach(({ wallet, balance }) => {
        const key = normalizeWallet(wallet);
        if (!key) return;
        if (nextBalances[key] !== balance) {
          nextBalances[key] = balance;
          changed = true;
        }
      });

      if (!changed) {
        return state;
      }

      return { balances: nextBalances };
    }),
}));

export function useTaiBalance(wallet: string | null | undefined): number | undefined {
  const normalized = wallet ? normalizeWallet(wallet) : '';
  return useTaiBalanceStore((state) => {
    if (!normalized) return undefined;
    return state.balances[normalized];
  });
}
