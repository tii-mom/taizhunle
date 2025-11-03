import { API_BASE_URL, handleApiResponse } from './shared';

export type RedpacketSession = {
  purchaseId: string;
  address: string;
  memo: string;
  priceTON: number;
  baseTAI: number;
  maxTAI: number;
  expiresAt: number;
  accelerate: boolean;
};

export type RedpacketPurchaseStatus = {
  purchaseId: string;
  unsignedBoc: string;
  amountTAI: number;
  tonAmount: number;
  memo: string;
  accelerate: boolean;
  multiplier: number;
};

export async function createRedpacketSession(wallet: string): Promise<RedpacketSession> {
  const response = await fetch(`${API_BASE_URL}/redpacket/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallet }),
  });

  return handleApiResponse<RedpacketSession>(response);
}

export async function queryRedpacketPurchase(wallet: string, memo: string): Promise<RedpacketPurchaseStatus | null> {
  const response = await fetch(`${API_BASE_URL}/redpacket/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallet, memo }),
  });

  if (response.status === 404) {
    return null;
  }

  return handleApiResponse<RedpacketPurchaseStatus>(response);
}

export async function submitRedpacketSignature(
  wallet: string,
  memo: string,
  signature: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/redpacket/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallet, memo, signature }),
  });

  return handleApiResponse<{ success: boolean }>(response);
}
