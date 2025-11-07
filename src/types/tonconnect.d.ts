import '@tonconnect/ui-react';
import '@tonconnect/ui';
import type { ActionConfiguration, SendTransactionResponse } from '@tonconnect/ui';

declare module '@tonconnect/ui-react' {
  interface SendTransactionRequest {
    /** Optional serialized BOC for legacy wallets */
    boc?: string;
  }
}

declare module '@tonconnect/ui' {
  interface BocSendTransactionRequest {
    validUntil: number;
    boc: string;
  }

  interface TonConnectUI {
    sendTransaction(
      tx: BocSendTransactionRequest,
      options?: ActionConfiguration & { onRequestSent?: (redirectToWallet: () => void) => void },
    ): Promise<SendTransactionResponse>;
  }
}
