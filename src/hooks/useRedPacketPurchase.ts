import { useCallback, useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { buildTonTransferMessage } from '../services/prebuiltTransactions';
import {
  createRedpacketSession,
  queryRedpacketPurchase,
  submitRedpacketSignature,
  type RedpacketPurchaseStatus,
} from '../services/redpacket';

export type PurchasePhase =
  | 'idle'
  | 'preparing'
  | 'awaitingWallet'
  | 'waitingConfirmation'
  | 'awaitingDistribution'
  | 'completed'
  | 'error';

export type PurchaseResult = RedpacketPurchaseStatus | null;

export function useRedPacketPurchase() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [phase, setPhase] = useState<PurchasePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResult>(null);
  const [sessionMemo, setSessionMemo] = useState<string | null>(null);

  const isProcessing = useMemo(() => phase !== 'idle' && phase !== 'completed' && phase !== 'error', [phase]);

  const openWalletModal = useCallback(() => {
    if (tonConnectUI?.openModal) {
      tonConnectUI.openModal();
    }
  }, [tonConnectUI]);

  const finalizePurchase = useCallback(async (status: RedpacketPurchaseStatus, walletAddress: string) => {
    if (!tonConnectUI) {
      throw new Error('ton-connect-unavailable');
    }

    const validUntil = Math.floor(Date.now() / 1000) + 300;
    const signed = await tonConnectUI.sendTransaction({
      validUntil,
      boc: status.unsignedBoc,
    });

    await submitRedpacketSignature(walletAddress, status.memo, signed.boc);
    setPhase('completed');
  }, [tonConnectUI]);

  const startPurchase = useCallback(async () => {
    setError(null);
    setResult(null);

    const rawAddress = wallet?.account?.address;
    if (!rawAddress) {
      openWalletModal();
      throw new Error('wallet-not-connected');
    }

    try {
      setPhase('preparing');
      const session = await createRedpacketSession(rawAddress);
      setSessionMemo(session.memo);

      setPhase('awaitingWallet');
      const validUntil = Math.floor(Date.now() / 1000) + 300;
      await tonConnectUI.sendTransaction({
        validUntil,
        messages: [buildTonTransferMessage(session.address, session.priceTON, session.memo)],
      });

      setPhase('waitingConfirmation');

      let attempts = 0;
      const maxAttempts = 24; // ~2 minutes with 5s interval
      while (attempts < maxAttempts) {
        const status = await queryRedpacketPurchase(rawAddress, session.memo);
        if (status) {
          setResult(status);
          setPhase('awaitingDistribution');
          await finalizePurchase(status, rawAddress);
          return status;
        }
        attempts += 1;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      throw new Error('payment-timeout');
    } catch (err) {
      if (err instanceof Error && err.message !== 'wallet-not-connected') {
        setError(err.message);
      }
      setPhase('error');
      throw err;
    }
  }, [wallet, tonConnectUI, finalizePurchase, openWalletModal]);

  const reset = useCallback(() => {
    setPhase('idle');
    setError(null);
    setResult(null);
    setSessionMemo(null);
  }, []);

  return {
    phase,
    error,
    result,
    sessionMemo,
    isProcessing,
    startPurchase,
    reset,
    wallet,
    openWalletModal,
  };
}
