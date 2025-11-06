import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchWhitelistQuota, fetchWhitelistStatus, type WhitelistQuotaResponse, type WhitelistStatus } from '../services/whitelist';

export const whitelistStatusQueryKey = ['whitelist', 'status'] as const;

export function useWhitelistStatus(options?: UseQueryOptions<WhitelistStatus>) {
  return useQuery({
    queryKey: whitelistStatusQueryKey,
    queryFn: fetchWhitelistStatus,
    staleTime: 30_000,
    ...options,
  });
}

export function useWhitelistQuota(wallet?: string) {
  return useQuery<WhitelistQuotaResponse>({
    queryKey: ['whitelist', 'quota', wallet ?? ''],
    queryFn: () => fetchWhitelistQuota(wallet ?? ''),
    enabled: Boolean(wallet),
    staleTime: 60_000,
  });
}
