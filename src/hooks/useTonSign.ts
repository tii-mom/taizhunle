import { useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const useTonSign = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sign = useCallback(
    async (text: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await tonConnectUI.signData({ type: 'text', text });
        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('sign-error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tonConnectUI],
  );

  return { sign, loading, error };
};
