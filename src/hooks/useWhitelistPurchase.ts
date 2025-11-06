import { useCallback, useMemo, useState } from 'react';
import { Address, Cell, beginCell } from '@ton/core';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

const PURCHASE_WHITELIST_OP = 0x80ea098e;
const GAS_FEE_TON = Number.parseFloat(import.meta.env.VITE_WHITELIST_GAS_TON ?? '0.15');
const CONTROLLER_ADDRESS = (import.meta.env.VITE_TAI_UNLOCK_CONTROLLER ?? '').trim();

export type WhitelistPurchasePhase =
  | 'idle'
  | 'awaitingWallet'
  | 'submitted'
  | 'error';

function toNanoString(valueTon: number): string {
  return Math.max(0, Math.round(valueTon * 1e9)).toString();
}

function buildWhitelistPayload(amount: bigint, quota: bigint, beneficiary: Address, proofBase64: string | null) {
  const builder = beginCell();
  builder.storeUint(PURCHASE_WHITELIST_OP, 32);
  builder.storeInt(amount, 257);
  builder.storeInt(quota, 257);

  if (proofBase64) {
    builder.storeBit(true);
    builder.storeRef(Cell.fromBase64(proofBase64));
  } else {
    builder.storeBit(false);
  }

  builder.storeAddress(beneficiary);
  return builder.endCell().toBoc().toString('base64');
}

export function useWhitelistPurchase() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [phase, setPhase] = useState<WhitelistPurchasePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{ payload: string; timestamp: number } | null>(null);

  const controllerConfigured = useMemo(() => CONTROLLER_ADDRESS.length > 0, []);

  const openWalletModal = useCallback(() => {
    if (tonConnectUI?.openModal) {
      tonConnectUI.openModal();
    }
  }, [tonConnectUI]);

  const reset = useCallback(() => {
    setPhase('idle');
    setError(null);
  }, []);

  const submitPurchase = useCallback(
    async (params: { amount: number; quota: number; proof: string | null }) => {
      setError(null);

      if (!controllerConfigured) {
        const message = 'whitelist-controller-not-configured';
        setError(message);
        setPhase('error');
        throw new Error(message);
      }

      const walletAddress = wallet?.account?.address;
      if (!walletAddress) {
        openWalletModal();
        const message = 'wallet-not-connected';
        setError(message);
        setPhase('error');
        throw new Error(message);
      }

      if (!Number.isFinite(params.amount) || params.amount <= 0) {
        const message = 'invalid-amount';
        setError(message);
        setPhase('error');
        throw new Error(message);
      }

      const quotaInt = BigInt(Math.floor(params.quota));
      const amountInt = BigInt(Math.floor(params.amount));

      if (amountInt > quotaInt) {
        const message = 'amount-exceeds-quota';
        setError(message);
        setPhase('error');
        throw new Error(message);
      }

      let beneficiary: Address;
      try {
        const parsed = Address.parseFriendly ? Address.parseFriendly(walletAddress) : null;
        beneficiary = parsed ? parsed.address : Address.parse(walletAddress);
      } catch (parseError) {
        const message = 'invalid-wallet-address';
        setError(message);
        setPhase('error');
        throw parseError instanceof Error ? parseError : new Error(message);
      }

      const payload = buildWhitelistPayload(amountInt, quotaInt, beneficiary, params.proof);

      if (!tonConnectUI) {
        const message = 'ton-connect-not-ready';
        setError(message);
        setPhase('error');
        throw new Error(message);
      }

      setPhase('awaitingWallet');

      try {
        const validUntil = Math.floor(Date.now() / 1000) + 600;
        const response = await tonConnectUI.sendTransaction({
          validUntil,
          messages: [
            {
              address: CONTROLLER_ADDRESS,
              amount: toNanoString(GAS_FEE_TON),
              payload,
            },
          ],
        });

        setLastSubmission({ payload: response.boc, timestamp: Date.now() });
        setPhase('submitted');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'transaction-failed';
        setError(message);
        setPhase('error');
        throw err;
      }
    },
    [controllerConfigured, openWalletModal, tonConnectUI, wallet?.account?.address],
  );

  return {
    controllerAddress: CONTROLLER_ADDRESS,
    controllerConfigured,
    phase,
    error,
    lastSubmission,
    submitPurchase,
    reset,
    openWalletModal,
  } as const;
}
