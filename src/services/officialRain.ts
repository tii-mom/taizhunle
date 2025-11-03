import { API_BASE_URL, handleApiResponse } from './shared';

export type OfficialRainClaimPayload = {
  wallet: string;
  telegramId?: number;
  telegramUsername?: string;
};

export type OfficialRainClaimResponse = {
  unsignedBoc: string;
  amount: number;
  qualified: boolean;
  rainId: string;
};

export async function claimOfficialRain(payload: OfficialRainClaimPayload): Promise<OfficialRainClaimResponse> {
  const response = await fetch(`${API_BASE_URL}/official/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<OfficialRainClaimResponse>(response);
}
