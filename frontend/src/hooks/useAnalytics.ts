import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface AnalyticsMetrics {
  totalTickets: bigint;
  openTickets: bigint;
  resolvedTickets: bigint;
  resolutionRate: bigint;
}

export function useGetAnalyticsMetrics() {
  const { actor, isFetching } = useActor();
  return useQuery<AnalyticsMetrics>({
    queryKey: ['analyticsMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAnalyticsMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
