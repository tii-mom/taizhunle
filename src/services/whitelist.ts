import { API_BASE_URL, handleApiResponse } from './shared';

export type WhitelistStatus = {
  active: boolean;
  total: number;
  sold: number;
  remaining: number;
  baselinePrice: number;
  currentPrice: number;
  windowEnd: number;
};

export type WhitelistQuotaResponse = {
  wallet: string;
  quota: number;
  proof: string | null;
};

export async function fetchWhitelistStatus(): Promise<WhitelistStatus> {
  const response = await fetch(`${API_BASE_URL}/whitelist/status`);
  return handleApiResponse<WhitelistStatus>(response);
}

export async function fetchWhitelistQuota(wallet: string): Promise<WhitelistQuotaResponse> {
  const url = new URL(`${API_BASE_URL}/whitelist/quota`, window.location.origin);
  url.searchParams.set('wallet', wallet);
  const response = await fetch(url.toString());
  return handleApiResponse<WhitelistQuotaResponse>(response);
}
