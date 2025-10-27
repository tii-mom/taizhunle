import { useCallback, useEffect, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export function useTonSignature() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(Boolean(wallet));
  }, [wallet]);

  const requestSignature = useCallback(
    async (text: string) => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      if (!tonConnectUI) {
        throw new Error('TonConnect UI not initialized');
      }

      return tonConnectUI.signData({
        type: 'text',
        text,
      });
    },
    [tonConnectUI, wallet],
  );

  return {
    wallet,
    isReady,
    requestSignature,
  };
}
