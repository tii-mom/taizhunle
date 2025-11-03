import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimOfficialRain, type OfficialRainClaimResponse } from '../services/officialRain';

export function useOfficialRainClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimOfficialRain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['official', 'rain', 'next'] });
    },
  });
}

export type OfficialRainClaimResult = OfficialRainClaimResponse;
